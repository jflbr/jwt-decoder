function base64Decode(base64Str: string){
    let base64 = base64Str.replace('-', '+').replace('_', '/').replace('"', '').replace("Bearer", '');
    return JSON.parse(Buffer.from(base64, 'base64').toString('binary'));
}

export function decodeToken(token: string = '') {
    let parts = token.split('.');
    let headers = parts[0];
    let payload = parts.length > 1 ? parts[1]: null;
    return {
        headers: base64Decode(headers),
        payload: payload ? base64Decode(payload): ""
    };
}
