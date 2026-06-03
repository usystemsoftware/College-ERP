const { Book, IssueRecord } = require('./library.model');
const Invoice = require('../fees/fees.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// --- Book Management ---

const addBook = async (req, res, next) => {
  try {
    const { title, author, isbn, publisher, category, totalCopies, location } = req.body;
    
    let book = await Book.findOne({ isbn });
    if (book) {
      throw new ApiError(400, 'Book with this ISBN already exists');
    }

    book = await Book.create({
      title, author, isbn, publisher, category, totalCopies, availableCopies: totalCopies, location
    });

    return res.status(201).json(new ApiResponse(201, { book }, 'Book added successfully'));
  } catch (error) {
    next(error);
  }
};

const getBooks = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;

    const books = await Book.find(filter).sort({ title: 1 });

    return res.status(200).json(new ApiResponse(200, { books }, 'Books fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// --- Circulation Management ---

const issueBook = async (req, res, next) => {
  try {
    const { bookId, userId, dueDate } = req.body;

    const book = await Book.findById(bookId);
    if (!book) throw new ApiError(404, 'Book not found');

    if (book.availableCopies <= 0) {
      throw new ApiError(400, 'No copies available for issue');
    }

    const record = await IssueRecord.create({
      bookId, userId, dueDate, issuedBy: req.user._id
    });

    book.availableCopies -= 1;
    await book.save();

    return res.status(201).json(new ApiResponse(201, { record }, 'Book issued successfully'));
  } catch (error) {
    next(error);
  }
};

const returnBook = async (req, res, next) => {
  try {
    const { id } = req.params; // IssueRecord ID

    const record = await IssueRecord.findById(id).populate('bookId');
    if (!record) throw new ApiError(404, 'Issue record not found');
    
    if (record.status === 'Returned') {
      throw new ApiError(400, 'Book already returned');
    }

    record.returnDate = new Date();
    record.status = 'Returned';

    // Calculate Fine (Mock: 10 units per day late)
    if (record.returnDate > record.dueDate) {
      const diffTime = Math.abs(record.returnDate - record.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      record.fineAmount = diffDays * 10;
      
      // We could optionally generate a fine Invoice here if we want tight coupling
      // await Invoice.create({ ... })
    }

    await record.save();

    // Increment available copies
    const book = await Book.findById(record.bookId._id);
    book.availableCopies += 1;
    await book.save();

    return res.status(200).json(new ApiResponse(200, { record }, 'Book returned successfully'));
  } catch (error) {
    next(error);
  }
};

const getCirculationHistory = async (req, res, next) => {
  try {
    const { userId } = req.query;
    let filter = {};

    if (userId) filter.userId = userId;
    // If student, force their own ID
    if (req.user && req.user.role && req.user.role.name === 'Student') {
       filter.userId = req.user._id;
    }

    const history = await IssueRecord.find(filter)
      .populate('bookId', 'title author isbn')
      .populate('userId', 'email') // In real app, populate Student profile
      .sort({ issueDate: -1 });

    return res.status(200).json(new ApiResponse(200, { history }, 'Circulation history fetched successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBook,
  getBooks,
  issueBook,
  returnBook,
  getCirculationHistory
};
