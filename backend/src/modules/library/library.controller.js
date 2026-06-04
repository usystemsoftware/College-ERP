const { Book: LibraryBook, IssueRecord: BookIssue } = require('./library.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

const getBooks = async (req, res, next) => {
  try {
    const { search, category, available, page = 1, limit = 20 } = req.query;
    const filter = { collegeId: req.user.collegeId };
    if (category) filter.category = category;
    if (available === 'true') filter.availableCopies = { $gt: 0 };
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [books, total] = await Promise.all([
      LibraryBook.find(filter).sort({ title: 1 }).skip(skip).limit(parseInt(limit)),
      LibraryBook.countDocuments(filter)
    ]);
    return res.json(new ApiResponse(200, { books, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } }, 'Books fetched'));
  } catch (error) { next(error); }
};

const createBook = async (req, res, next) => {
  try {
    const exists = await LibraryBook.findOne({ isbn: req.body.isbn });
    if (exists) throw new ApiError(400, 'Book with this ISBN already exists');
    const book = await LibraryBook.create({ ...req.body, collegeId: req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, book, 'Book added'));
  } catch (error) { next(error); }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await LibraryBook.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) throw new ApiError(404, 'Book not found');
    return res.json(new ApiResponse(200, book, 'Book updated'));
  } catch (error) { next(error); }
};

const issueBook = async (req, res, next) => {
  try {
    const { userId, dueDate } = req.body;
    const book = await LibraryBook.findById(req.params.bookId);
    if (!book) throw new ApiError(404, 'Book not found');
    if (book.availableCopies <= 0) throw new ApiError(400, 'No copies available');

    const issue = await BookIssue.create({
      bookId: req.params.bookId, 
      userId: userId,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      issuedBy: req.user._id, 
      collegeId: req.user.collegeId
    });

    await LibraryBook.findByIdAndUpdate(req.params.bookId, { $inc: { availableCopies: -1 } });
    return res.status(201).json(new ApiResponse(201, issue, 'Book issued'));
  } catch (error) { next(error); }
};

const returnBook = async (req, res, next) => {
  try {
    const issue = await BookIssue.findById(req.params.issueId);
    if (!issue) throw new ApiError(404, 'Issue record not found');
    if (issue.status === 'Returned') throw new ApiError(400, 'Book already returned');

    const returnDate = new Date();
    const isOverdue = returnDate > issue.dueDate;
    const overdueDays = isOverdue ? Math.ceil((returnDate - issue.dueDate) / (1000 * 60 * 60 * 24)) : 0;
    const fineAmount = overdueDays * 5; // Rs 5 per day

    issue.returnDate = returnDate;
    issue.status = 'Returned';
    issue.fineAmount = fineAmount;
    await issue.save();

    await LibraryBook.findByIdAndUpdate(issue.bookId, { $inc: { availableCopies: 1 } });
    return res.json(new ApiResponse(200, { issue, fineAmount }, 'Book returned'));
  } catch (error) { next(error); }
};

const getMyIssues = async (req, res, next) => {
  try {
    const issues = await BookIssue.find({ userId: req.user._id, status: { $ne: 'Returned' } })
      .populate('bookId', 'title isbn author')
      .sort({ dueDate: 1 });
    return res.json(new ApiResponse(200, issues, 'Active issues fetched'));
  } catch (error) { next(error); }
};

module.exports = { getBooks, createBook, updateBook, issueBook, returnBook, getMyIssues };
