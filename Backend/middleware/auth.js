import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthenticated" });

        const decodedData = jwt.verify(token, "test");
        req.userId = decodedData?.id;

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Unauthenticated" });
    }
};

export default auth;
