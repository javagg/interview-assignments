import {Request, Response} from 'express';
import ShortUrl, {IUrl} from '../app/model';
import {validateUrl, generateId} from './utils'

export async function queryUrlById(req: Request, res: Response) {
    const {shortId} = req.params;
    if (!shortId) {
        return res.status(400).json({message: 'shortId is not provided'});
    }
    try {
        const record = await ShortUrl.findOne({shortId});
        if (!record) {
            return res.status(400).json({message: 'shortId is invalid'});
        }
        return res.status(200).json({url: record.url, shortened: record.shortened});
    } catch (error) {
        return res.status(500).json({message: 'Some thing went wrong!'});
    }
}

export async function shortenUrl(req: Request, res: Response) {
    const {url} = req.body;
    if (!url) {
        return res.status(400).json({message: 'url is not provided'});
    }
    if (!validateUrl(url)) {
        return res.status(400).json({message: 'url is invalid'});
    }
    try {
        const record = await ShortUrl.findOne({url});
        if (record) {
            return res.status(200).json({url: record.url, shortened: record.shortened});
        }

        const seq = await ShortUrl.countDocuments();
        const shortId = generateId(seq);
        if (shortId.length > 8) {
            return res.status(500).json({message: 'Out of short ids'});
        }

        const formatted = new URL(url);
        const shortened = `${formatted.origin}/${shortId}`;
        const newUrl = {
            url,
            shortId,
            shortened
        };
        const newRecord: IUrl | null = await ShortUrl.create(newUrl);
        return res.status(200).json({url: newRecord.url, shortened: newRecord.shortened});
    } catch (error) {
        return res.status(500).json({message: 'Some thing went wrong!'});
    }
}