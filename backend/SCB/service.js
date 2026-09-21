import axios from 'axios';
import crypto from "crypto"; 
 
export const getAccessToken = async () => {
    const response = await axios.post('https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token',
        {
            "applicationKey" : `${process.env.SCB_API_KEY}`,
            "applicationSecret" : `${process.env.SCB_API_SECRET}`,
            "grantType": "client_credentials"
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'accept-language': 'EN',
                'requestUId': crypto.randomUUID(),
                'resourceOwnerId': process.env.SCB_API_KEY
            }
        }
    )

    return response.data.data.accessToken;
}

export const createSCBQR = async (amount) => {

    const accessToken = await getAccessToken();

    const res = await axios.post('https://api-sandbox.partners.scb/partners/sandbox/v1/payment/qrcode/create',
        {
            "qrType": "PP",
            "ppType": "BILLERID",
            "ppId": process.env.SCB_BILLER_ID,
            "amount": amount.toFixed(2),
            "ref1": "REFERENCE1",
            "ref2": "REFERENCE2",
            "ref3": "SCB"
        },
        {
            headers: {
                "content-type": "application/json",
                'accept-language': 'EN',
                "authorization": `Bearer ${accessToken}`,
                "requestUId": crypto.randomUUID(),
                "resourceOwnerId": process.env.SCB_API_KEY
            }
        }
    );

    return res.data;
}

export const confirmRef = async (transRef) => {

    const accessToken = await getAccessToken();

    const res = await axios.get(`https://api-sandbox.partners.scb/partners/sandbox/v1/payment/billpayment/transactions/${transRef}?sendingBank=014`,{
        headers: {
            "resourceOwnerId": process.env.SCB_API_KEY,
            "requestUId": crypto.randomUUID(),
            "authorization": `Bearer ${accessToken}`,
            "accept-language": "EN"
        }
    });

    return res.data;
}