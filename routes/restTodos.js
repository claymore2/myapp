const router = require('express').Router();
const logger = require('../config/logger');
const User = require('../models/users');
const mongoose = require('mongoose');
const todoModels = require('../models/todos');
const Todos = mongoose.model('Todo', todoModels.todos);
const Categories = mongoose.model('Category', todoModels.categories);
const fn = require('../routes/functions');
const moment = require('moment');

router.get('/api/todos', function(req, res, next) {
    var uid = req.query.uid;
    var todoId = req.query.todoId;
    var categoryId = req.query.categoryId;
    logger.info('[/api/todos] list', uid, todoId, categoryId);
    var uData  = {};
    uData._id = uid;
    fn.fnDb.userInfo(uData, function(user) {
        if(user) {
            var fData = {};
            fData['USER'] = user._id;
            if(!fn.isEmpty(todoId)) fData['_id'] = todoId;
            if(!fn.isEmpty(categoryId)) fData['CATEGORY'] = categoryId;
            Todos.find(fData)
            .populate('USER')
            .populate('CATEGORY')
            .exec(function(err, todos) {
                if (err) {
                    return res.json({
                        'result': 'fail',
                        'msg': fn.fMsg(1, 'ko-KR')
                    });
                }
                return res.json(todos);
            });
        } else {
            res.json(null);
        }
    });
});

router.post('/api/todos', function(req, res, next) {
    var todo = req.body;
    logger.info('[/api/todos] create', todo);
    var uData  = {};
    uData._id = todo.USER;
    fn.fnDb.userInfo(uData, function(user) {
        if(user) {
            var newTodo = new Todos(todo);
            newTodo.save(function(err) {
                if (err) {
                    logger.error("[/api/todos] err", err);
                    return res.json({
                        'result': 'fail',
                        'msg': fn.fMsg(1, 'ko-KR')
                    });
                }
                logger.info('[/api/todos] new todo saved', fn.objectIdToStr(newTodo._id));
                res.json({
                    'result': 'success',
                    'msg': '할 일이 등록되었습니다.'
                });
            });
        } else {
            res.json(null);
        }
    });
});

router.put('/api/todos', function(req, res, next) {
    var uid = req.query.uid;
    var todo = req.query.id;
    var newTodo = req.body;
    logger.info('[/api/todos] update', todo);
    var uData  = {};
    uData._id = uid;
    fn.fnDb.userInfo(uData, function(user) {
        if(user) {
            Todos.findOneAndUpdate({
                _id: todo
            }, newTodo, {new: true}, function(err, updated) {
                logger.info('[/api/todos] todo updated');
                res.json({
                    'result': 'success',
                    'msg': '할 일이 수정되었습니다.',
                    'todo': updated
                });
            });
        } else {
            res.json(null);
        }
    });
});

router.delete('/api/todos', function(req, res, next) {
    var uid = req.query.uid;
    var todo = req.query.id;
    logger.info('[/api/todos] delete', uid, todo);
    var uData  = {};
    uData._id = uid;
    fn.fnDb.userInfo(uData, function(user) {
        if(user) {
            Todos.remove({
                _id: todo
            }, function(err, rst) {
                logger.info('[/api/todos] todo deleted', rst);
                res.json({
                    'result': 'success',
                    'msg': '할 일이 삭제되었습니다.'
                });
            });
        } else {
            res.json(null);
        }
    });
});

router.get('/api/categories', function(req, res, next) {
    var uid = req.query.uid;
    logger.info('[/api/categories] list', uid);
    var uData  = {};
    uData._id = uid;
    fn.fnDb.userInfo(uData, function(user) {
        if(user) {
            var fData = {};
            fData['USER'] = user._id;
            Categories.find(fData)
            .populate('USER')
            .exec(function(err, categories) {
                if (err) {
                    return res.json({
                        'result': 'fail',
                        'msg': fn.fMsg(1, 'ko-KR')
                    });
                }
                return res.json(categories);
            });
        } else {
            res.json(null);
        }
    });
});

router.post('/api/categories', function(req, res, next) {
    var category = req.body;
    logger.info('[/api/categories] create', category);
    var uData  = {};
    uData._id = category.USER;
    fn.fnDb.userInfo(uData, function(user) {
        if(user) {
            var newCategory = new Categories(category);
            newCategory.save(function(err) {
                if (err) {
                    logger.error("[/api/categories] err", err);
                    return res.json({
                        'result': 'fail',
                        'msg': fn.fMsg(1, 'ko-KR')
                    });
                }
                logger.info('[/api/categories] new category saved', fn.objectIdToStr(newCategory._id));
                res.json({
                    'result': 'success',
                    'msg': '카테고리가 등록되었습니다.'
                });
            });
        } else {
            res.json(null);
        }
    });
});

router.put('/api/categories', function(req, res, next) {
    var uid = req.query.uid;
    var id = req.query.id;
    var newCategory = req.body;
    logger.info('[/api/categories] update', newCategory);
    var uData  = {};
    uData._id = uid;
    fn.fnDb.userInfo(uData, function(user) {
        if(user) {
            Categories.findOneAndUpdate({
                _id: id
            }, newCategory, {new: true}, function(err, updated) {
                logger.info('[/api/categories] category updated');
                res.json({
                    'result': 'success',
                    'msg': '카테고리가 수정되었습니다.',
                    'todo': updated
                });
            });
        } else {
            res.json(null);
        }
    });
});

router.delete('/api/categories', function(req, res, next) {
    var uid = req.query.uid;
    var id = req.query.id;
    logger.info('[/api/categories] delete', uid, id);
    var uData  = {};
    uData._id = uid;
    fn.fnDb.userInfo(uData, function(user) {
        if(user) {
            Categories.remove({
                _id: id
            }, function(err, rst) {
                Todos.update({
                    'CATEGORY': id
                }, {
                    $unset: {
                        'CATEGORY': null
                    }
                }, {multi: true}, function(err, updated) {
                    logger.info('[/api/categories] category deleted', rst);
                    res.json({
                        'result': 'success',
                        'msg': '카테고리가 삭제되었습니다.'
                    });
                });
            });
        } else {
            res.json(null);
        }
    });
});

module.exports = router;