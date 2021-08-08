module.exports.checkInFront = (req, res, next) => {
    
    var response = {
        "userId": req.extractedID,
        "role": req.extractedRole
    }

    res.status(200).send(response);

} //End of checkInFront