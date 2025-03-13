const express = require('express');
const router = express.Router();
const { searchUser , createCalenderEvent,  } = require('../controllers/msgraphUtilController');

// search user
router.post('/search-user', searchUser);

// create calender event
router.post('/create-calender-event', createCalenderEvent);

module.exports = router;
