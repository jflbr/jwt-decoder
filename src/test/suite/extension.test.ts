import * as assert from 'assert';
import { before } from 'mocha';
import * as vscode from 'vscode';
import { decodeToken, setHoverContent } from '../../jwt';

suite('JWT Decoder Extension Test Suite', () => {
	before(() => {
		vscode.window.showInformationMessage('Start all tests.');
	});

	suite('decodeToken', () => {
		test('Should decode a valid JWT token', () => {
			// Valid JWT token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
			const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
			const decoded = decodeToken(token);

			assert.strictEqual(decoded.headers.alg, 'HS256');
			assert.strictEqual(decoded.headers.typ, 'JWT');
			assert.strictEqual(decoded.payload.sub, '1234567890');
			assert.strictEqual(decoded.payload.name, 'John Doe');
			assert.strictEqual(decoded.payload.iat, 1516239022);
		});

		test('Should decode JWT with only header', () => {
			const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
			const decoded = decodeToken(token);

			assert.strictEqual(decoded.headers.alg, 'HS256');
			assert.strictEqual(decoded.headers.typ, 'JWT');
			assert.strictEqual(decoded.payload, '');
		});

		test('Should decode JWT with Bearer prefix', () => {
			const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
			const decoded = decodeToken(token);

			assert.strictEqual(decoded.headers.alg, 'HS256');
			assert.strictEqual(decoded.headers.typ, 'JWT');
			assert.strictEqual(decoded.payload.sub, '1234567890');
		});

		test('Should decode JWT with different algorithms', () => {
			// RS256 token header
			const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0MjEiLCJyb2xlIjoiYWRtaW4ifQ';
			const decoded = decodeToken(token);

			assert.strictEqual(decoded.headers.alg, 'RS256');
			assert.strictEqual(decoded.headers.typ, 'JWT');
			assert.strictEqual(decoded.payload.userId, '421');
			assert.strictEqual(decoded.payload.role, 'admin');
		});

		test('Should handle JWT with special characters in payload', () => {
			// Token with email and special characters: {"email":"user@example.com","role":"user"}
			const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciJ9';
			const decoded = decodeToken(token);

			assert.strictEqual(decoded.payload.email, 'user@example.com');
			assert.strictEqual(decoded.payload.role, 'user');
		});

		test('Should handle empty token', () => {
			const token = '';
			assert.throws(() => {
				decodeToken(token);
			});
		});

		test('Should handle token with quotes', () => {
			const token = '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0"';
			const decoded = decodeToken(token);

			assert.strictEqual(decoded.headers.alg, 'HS256');
			assert.strictEqual(decoded.payload.name, 'John Doe');
		});
	});

	suite('setHoverContent', () => {
		test('Should set hover content with headers and payload', () => {
			const hover = new vscode.Hover(new vscode.MarkdownString());
			const headers = JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 4);
			const payload = JSON.stringify({ sub: '1234567890', name: 'John Doe' }, null, 4);

			setHoverContent(hover, headers, payload);

			assert.strictEqual(hover.contents.length, 1);
			const content = hover.contents[0] as vscode.MarkdownString;
			assert.ok(content.value.includes('## Headers'));
			assert.ok(content.value.includes('## Payload'));
			assert.ok(content.value.includes('HS256'));
			assert.ok(content.value.includes('John Doe'));
		});

		test('Should replace existing hover content', () => {
			const initialContent = new vscode.MarkdownString('Initial content');
			const hover = new vscode.Hover(initialContent);
			const headers = JSON.stringify({ alg: 'RS256' }, null, 4);
			const payload = JSON.stringify({ userId: '123' }, null, 4);

			setHoverContent(hover, headers, payload);

			assert.strictEqual(hover.contents.length, 1);
			const content = hover.contents[0] as vscode.MarkdownString;
			assert.ok(!content.value.includes('Initial content'));
			assert.ok(content.value.includes('RS256'));
			assert.ok(content.value.includes('userId'));
		});

		test('Should format content as markdown code blocks', () => {
			const hover = new vscode.Hover(new vscode.MarkdownString());
			const headers = JSON.stringify({ alg: 'HS256' }, null, 4);
			const payload = JSON.stringify({ test: 'data' }, null, 4);

			setHoverContent(hover, headers, payload);

			const content = hover.contents[0] as vscode.MarkdownString;
			assert.ok(content.value.includes('```javascript'));
			assert.ok(content.value.match(/```/g)!.length >= 2);
		});
	});

	suite('Extension Activation', () => {
		test('Extension should be present', () => {
			assert.ok(vscode.extensions.getExtension('jflbr.jwt-decoder'));
		});

		test('Extension should activate', async () => {
			const extension = vscode.extensions.getExtension('jflbr.jwt-decoder');
			if (extension) {
				await extension.activate();
				assert.ok(extension.isActive);
			}
		});

		test('Command should be registered', async () => {
			const commands = await vscode.commands.getCommands(true);
			assert.ok(commands.includes('extension.jwt-decoder'));
		});
	});
});
