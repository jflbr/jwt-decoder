
import * as vscode from 'vscode';
import { decodeToken } from './jwt';
import { setHoverContent } from './jwt';


export function activate(context: vscode.ExtensionContext) {

    console.log('Extension "jwt-decoder" is now active!');
    const contents = new vscode.MarkdownString();
    contents.isTrusted = true;
    let hover = new vscode.Hover(contents);

    let hoverProvider = new class implements vscode.HoverProvider {

        token: string;
        tokenPosition: vscode.Position;

        constructor(token: string, tokenPosition: vscode.Position) {
            this.token = token;
            this.tokenPosition = tokenPosition;
        }

        setToken(token: string) {
            this.token = token;
        }

        setTokenPosition(position: vscode.Position) {
            this.tokenPosition = position;
        }

        provideHover(
        document: vscode.TextDocument,
        _position: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {

        if ( _position.isEqual(this.tokenPosition) || _position.line == this.tokenPosition.line)    
            return hover;
        return undefined;
    }
     }("", new vscode.Position(0,0));


    vscode.languages.registerHoverProvider(
        '*',
        hoverProvider
    );

	let disposable = vscode.commands.registerTextEditorCommand('extension.jwt-decoder', async (textEditor, edit) => {
        let token = null;

		if ( !textEditor.selection.isEmpty ) {
            token = textEditor.document.getText(textEditor.selection);
            hoverProvider.setToken(token);
            hoverProvider.setTokenPosition(textEditor.selection.start);
		}
		else {
			token = await vscode.window.showInputBox({ placeHolder: 'Paste your base64 encoded JWT here' });
		}
		if (token === null){
			vscode.window.showWarningMessage("Base64 encoded JWT required");
			return;
        }

		let decodedToken = decodeToken(token);
		let headers = JSON.stringify(decodedToken.headers, null, 4);
		let payload = JSON.stringify(decodedToken.payload, null, 4);
		// insert the result two lines below the JWT when the document is untitled
		if ( textEditor.document.isUntitled ){
            var resultPosition = new vscode.Position((textEditor.selection.end.line + 2), 1);
            edit.insert(resultPosition, '\n\n> Headers\n');
            edit.insert(resultPosition, headers);
            edit.insert(resultPosition, '\n\n> Payload\n');
            edit.insert(resultPosition, payload);
        }
        // display the message inside a tooltip/hover box
        else  if ( !( textEditor.document.isUntitled ) && !textEditor.selection.isEmpty ){
            hoverProvider.setToken(token? token: '');
            hoverProvider.setTokenPosition(textEditor.selection.start);

            setHoverContent(hover, headers, payload);
        }
		// display the result inside a message box
		else {
            hoverProvider.setToken('');
			vscode.window.showInformationMessage(headers);
			vscode.window.showInformationMessage(payload);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
