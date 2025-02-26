import { Request, Response } from "express";

async function checkRequiredField(requiredFields: string[], req: Request, res: Response): Promise<Array<string> | undefined> {
    const body = JSON.parse(await req.body);
    if (!requiredFields.every((field: string) => field in body)) {
        res.status(400).json({ message: `Missing required fields: ${requiredFields.filter((field: string) => !(field in body)).join(", ")}` });
        return;
    }
    return body;
}

export default checkRequiredField;