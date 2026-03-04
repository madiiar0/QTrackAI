import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
    const token = req.cookies['auth_token'];
    if(!token){
        return res.status(401).json({ success: false, message: "Token is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            throw new Error("Token is invalid");
        }
        req.userId = decoded.userId;
        next();
    } catch(error){
        res.status(401).json({success: false, message: error.message});
    }
}
