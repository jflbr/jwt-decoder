
import * as vscode from 'vscode';
import { decodeToken } from './jwt';


export function activate(context: vscode.ExtensionContext) {

	console.log('Extension "jwt-decoder" is now active!');

	let disposable = vscode.commands.registerTextEditorCommand('extension.jwt-decoder', async (textEditor, edit) => {

		let selection = null;
		if ( !textEditor.selection.isEmpty ) {
			selection = textEditor.document.getText(textEditor.selection);
		}
		else {
			selection = await vscode.window.showInputBox({ placeHolder: 'Paste your base64 encoded JWT here' });
		}
		if (selection === null){
			vscode.window.showWarningMessage("Base64 encoded JWT required");
			return;
		}
		let decodedToken = decodeToken(selection);
		let headers = JSON.stringify(decodedToken.headers);
		let payload = JSON.stringify(decodedToken.payload);
		// insert the result two lines below the JWT when the document is untitled
		if ( textEditor.document.isUntitled && !textEditor.selection.isEmpty ){
			if (textEditor.document.isUntitled){
				var resultPosition = new vscode.Position((textEditor.selection.end.line + 2), 1);
				edit.insert(resultPosition, '\n\n> Headers\n');
				edit.insert(resultPosition, headers);
				edit.insert(resultPosition, '\n\n> Payload\n');
				edit.insert(resultPosition, payload);
			}
			// display the message inside a tooltip/hover box
			else {
				
				var _ = new vscode.Hover({language: 'json', value: headers});
				vscode.window.showWarningMessage('Hover feature is not available yet.');
			}
		}
		// display the result inside a message box
		else {
			vscode.window.showInformationMessage(`Decoded JWT\n\n${headers}\n\n${payload}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
