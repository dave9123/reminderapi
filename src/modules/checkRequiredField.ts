import { Request, Response } from "express";

function checkRequiredField(requiredFields, req: Request, res: Response) {
    const body = JSON.parse(req.body);
    if (!requiredFields.every(field => field in body)) {
        res.status(400).json({ message: `Missing required fields: ${requiredFields.filter(field => !(field in body)).join(", ")}` });
        return;
    }
    return body;
}

export default checkRequiredField;