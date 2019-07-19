import * as vscode from 'vscode';

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

export function setHoverContent(hover: vscode.Hover, headers: string, payload: string) {
    const contents = new vscode.MarkdownString(`## Headers\n\`\`\`javascript\n${headers}\n\`\`\`\n## Payload\n\`\`\`javascript\n${payload}\n\`\`\``);
    // update the hover content by removing the current content first
    for (var contentIndex=0; contentIndex < hover.contents.length; contentIndex++)
        hover.contents.shift();
    hover.contents.push(contents);
}
