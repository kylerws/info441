const getModifiedDate = async (req, res, { Team }) => {
    const {date} = req.body;
    
    // var d = new Date();
    date.setFullYear(1998)
    res.send(date)
}

module.exports = {getModifiedDate}
