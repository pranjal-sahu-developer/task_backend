"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.getAllStudents = exports.register = void 0;
const studentService_1 = require("../services/studentService");
const register = async (req, res) => {
    const payload = (0, studentService_1.validateEncryptedPayload)(req.body);
    const student = await (0, studentService_1.registerStudent)(payload);
    res.status(201).json({
        success: true,
        message: 'Student registered successfully',
        data: student,
    });
};
exports.register = register;
const getAllStudents = async (_req, res) => {
    const students = await (0, studentService_1.getStudents)();
    res.status(200).json({
        success: true,
        count: students.length,
        data: students,
    });
};
exports.getAllStudents = getAllStudents;
const update = async (req, res) => {
    const id = req.params.id;
    const payload = (0, studentService_1.validateEncryptedPayload)(req.body);
    const student = await (0, studentService_1.updateStudent)(id, payload);
    res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: student,
    });
};
exports.update = update;
const remove = async (req, res) => {
    const id = req.params.id;
    await (0, studentService_1.deleteStudent)(id);
    res.status(200).json({
        success: true,
        message: 'Student deleted successfully',
    });
};
exports.remove = remove;
