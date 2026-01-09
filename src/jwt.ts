import * as vscode from 'vscode';

function base64Decode(base64Str: string){
    let base64 = base64Str.replace('-', '+').replace('_', '/').replace('"', '').replace("Bearer", '');
    return JSON.parse(Buffer.from(base64, 'base64').toString('binary'));
}

export function isValidJWT(token: string): boolean {
    if (!token || typeof token !== 'string') {
        return false;
    }

    // Remove common prefixes and whitespace
    token = token.trim().replace(/^Bearer\s+/i, '');

    // JWT should have exactly 2 dots (3 parts: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
        return false;
    }

    // Each part should be a valid base64url string (non-empty)
    for (const part of parts) {
        if (!part || part.length === 0) {
            return false;
        }
        // Base64url uses A-Z, a-z, 0-9, -, _
        if (!/^[A-Za-z0-9_-]+$/.test(part)) {
            return false;
        }
    }

    // Try to decode the header to verify it's actually a JWT
    try {
        const headerBase64 = parts[0].replace('-', '+').replace('_', '/');
        const header = JSON.parse(Buffer.from(headerBase64, 'base64').toString('binary'));

        // A valid JWT header should have at least an 'alg' field
        if (!header || typeof header !== 'object' || !header.alg) {
            return false;
        }
    } catch (e) {
        return false;
    }

    return true;
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

export function setHoverContent(hover: vscode.Hover, headers: string, payload: string) {
    const contents = new vscode.MarkdownString(`## Headers\n\`\`\`javascript\n${headers}\n\`\`\`\n## Payload\n\`\`\`javascript\n${payload}\n\`\`\``);
    // update the hover content by removing the current content first
    for (var contentIndex=0; contentIndex < hover.contents.length; contentIndex++)
        hover.contents.shift();
    hover.contents.push(contents);
}
