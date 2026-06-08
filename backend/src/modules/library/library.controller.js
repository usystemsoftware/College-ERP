const { Book, IssueRecord } = require('./library.model');
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
      title, author, isbn, publisher, category, totalCopies, availableCopies: totalCopies, location,
      collegeId: req.user.collegeId
    });

    return res.status(201).json(new ApiResponse(201, { book }, 'Book added successfully'));
  } catch (error) {
    next(error);
  }
};

const getBooks = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let filter = { collegeId: req.user.collegeId };

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
    const finalBookId = req.params.bookId || bookId;

    const book = await Book.findById(finalBookId);
    if (!book) throw new ApiError(404, 'Book not found');
    if (book.availableCopies < 1) throw new ApiError(400, 'No copies available');

    const issue = await IssueRecord.create({
      bookId: finalBookId, userId: userId,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      issuedBy: req.user._id,
      collegeId: req.user.collegeId
    });

    book.availableCopies -= 1;
    await book.save();

    return res.status(201).json(new ApiResponse(201, { issue }, 'Book issued successfully'));
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
    await record.save();

    const bookId = record.bookId._id || record.bookId;
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });

    return res.json(new ApiResponse(200, { record }, 'Book returned'));
  } catch (error) { next(error); }
};

const getCirculationHistory = async (req, res, next) => {
  try {
    const issues = await IssueRecord.find({ userId: req.user._id, status: { $ne: 'Returned' } })
      .populate('bookId', 'title isbn author')
      .sort({ dueDate: 1 });
    return res.json(new ApiResponse(200, issues, 'Active issues fetched'));
  } catch (error) { next(error); }
};

const getLibraryDashboardStats = async (req, res, next) => {
  try {
    const isLibrarian = ['Librarian', 'Super Admin', 'College Admin'].includes(req.user.role.name);
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;

    let stats = {};

    const books = await Book.find(filter).sort({ title: 1 }).lean();
    const formattedBooks = books.map(b => ({
      id: b.isbn || b._id,
      title: b.title,
      author: b.author,
      category: b.category,
      available: b.availableCopies,
      total: b.totalCopies
    }));

    if (isLibrarian) {
      const records = await IssueRecord.find(filter)
        .populate('bookId', 'title')
        .populate('userId', 'email')
        .sort({ issueDate: -1 })
        .lean();
        
      const circulation = records.map(r => {
        let status = r.status || 'Issued';
        if (status !== 'Returned' && new Date(r.dueDate) < new Date()) {
          status = 'Overdue';
        }
        return {
          id: r._id,
          book: r.bookId?.title || 'Unknown Book',
          user: r.userId?.email || 'Unknown User',
          issueDate: r.issueDate ? new Date(r.issueDate).toLocaleDateString() : 'N/A',
          dueDate: r.dueDate ? new Date(r.dueDate).toLocaleDateString() : 'N/A',
          status: status
        };
      });

      stats = { books: formattedBooks, circulation };
    } else {
      const myRecords = await IssueRecord.find({ userId: req.user._id, status: { $ne: 'Returned' } })
        .populate('bookId', 'title')
        .sort({ dueDate: 1 })
        .lean();

      const circulation = myRecords.map(r => {
        let status = r.status || 'Issued';
        if (status !== 'Returned' && new Date(r.dueDate) < new Date()) {
          status = 'Overdue';
        }
        return {
          id: r._id,
          book: r.bookId?.title || 'Unknown Book',
          user: req.user.email || 'You',
          issueDate: r.issueDate ? new Date(r.issueDate).toLocaleDateString() : 'N/A',
          dueDate: r.dueDate ? new Date(r.dueDate).toLocaleDateString() : 'N/A',
          status: status
        };
      });

      stats = { books: formattedBooks, circulation };
    }

    return res.json(new ApiResponse(200, stats, 'Library dashboard stats fetched'));
  } catch (error) { next(error); }
};

module.exports = {
  addBook,
  getBooks,
  issueBook,
  returnBook,
  getCirculationHistory,
  getLibraryDashboardStats
};
