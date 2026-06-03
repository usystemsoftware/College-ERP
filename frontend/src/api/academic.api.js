import { get, post, put, del } from './client';

// Colleges
export const getColleges = () => get('/colleges');
export const getCollege = (id) => get(`/colleges/${id}`);
export const createCollege = (data) => post('/colleges', data);
export const updateCollege = (id, data) => put(`/colleges/${id}`, data);
export const deleteCollege = (id) => del(`/colleges/${id}`);

// Departments
export const getDepartments = (params) => get('/departments', { params });
export const createDepartment = (data) => post('/departments', data);
export const updateDepartment = (id, data) => put(`/departments/${id}`, data);
export const deleteDepartment = (id) => del(`/departments/${id}`);

// Courses
export const getCourses = (params) => get('/courses', { params });
export const createCourse = (data) => post('/courses', data);
export const updateCourse = (id, data) => put(`/courses/${id}`, data);
export const deleteCourse = (id) => del(`/courses/${id}`);

// Batches
export const getBatches = (params) => get('/batches', { params });
export const createBatch = (data) => post('/batches', data);
export const updateBatch = (id, data) => put(`/batches/${id}`, data);
export const deleteBatch = (id) => del(`/batches/${id}`);

// Subjects
export const getSubjects = (params) => get('/subjects', { params });
export const createSubject = (data) => post('/subjects', data);
export const updateSubject = (id, data) => put(`/subjects/${id}`, data);
export const deleteSubject = (id) => del(`/subjects/${id}`);

// Semesters
export const getSemesters = (params) => get('/semesters', { params });
export const getCurrentSemester = () => get('/semesters/current');
export const createSemester = (data) => post('/semesters', data);
export const updateSemester = (id, data) => put(`/semesters/${id}`, data);
export const deleteSemester = (id) => del(`/semesters/${id}`);

// Academic Years
export const getAcademicYears = () => get('/academic-years');
export const getCurrentAcademicYear = () => get('/academic-years/current');
export const createAcademicYear = (data) => post('/academic-years', data);
export const updateAcademicYear = (id, data) => put(`/academic-years/${id}`, data);
export const deleteAcademicYear = (id) => del(`/academic-years/${id}`);
