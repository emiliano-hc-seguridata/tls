/* eslint-disable no-undef*/
import { useRef, useState } from 'react';
import { arrayBufferToString } from "./SgDataCryptoJsLitev1.7.NOMIN.js";




const Sign = props => {

	const titulo = {
		color: "white",
		backgroundColor: "DodgerBlue",
		padding: "10px",
		fontFamily: "Arial"
	};

	const [privateKeyBuffer, setPrivateKeyBuffer] = useState(new ArrayBuffer(0)); // ArrayBuffer with loaded private key
	const [certificateBuffer, setCertificateBuffer] = useState(new ArrayBuffer(0));
	const passwordRef = useRef('');
	const hashRef = useRef(0);

	const handleParsingPrivKeyFile = evt => {
		var temp_reader = new FileReader();

		var current_files = evt.target.files;

		temp_reader.onload =
			function (event) {
				setPrivateKeyBuffer(event.target.result);
				console.log('set succesfully');
			};
		console.log('evt called');
		temp_reader.readAsArrayBuffer(current_files[0]);
	}

	const handleParsingCertFile = evt => {
		var temp_reader = new FileReader();
		var current_files = evt.target.files;
		temp_reader.onload =
			function (event) {
				setCertificateBuffer(event.target.result);
			};

		temp_reader.readAsArrayBuffer(current_files[0]);
	}

	function signData() {
		//Validating form variables

		console.log('signData');
		if (document.getElementById("password").value == '') {
			alert("You must enter private key password");
			return;
		}

		if (privateKeyBuffer.byteLength === 0) {
			alert("You must select signer's private key");
			return;
		}

		if (certificateBuffer.byteLength === 0) {
			alert("You must select signer's certificate");
			return;
		}

		if (document.getElementById("hashToSign").value == '') {
			alert("You must enter hash to sign");
			return;
		}

		let hashAlgorithm;
		let hashOption = document.getElementById("hashAlg").value;
		document.getElementById("signature").innerHTML = "";

		switch (hashOption) {
			case "alg_SHA1":
				hashAlgorithm = "sha1";
				break;
			case "alg_SHA256":
				hashAlgorithm = "sha256";
				break;
			case "alg_SHA384":
				hashAlgorithm = "sha384";
				break;
			case "alg_SHA512":
				hashAlgorithm = "sha512";
				break;
			default: ;
		}

		var cipheredKey;
		var privateKeyBufferString = arrayBufferToString(privateKeyBuffer);
		var pKey = privateKeyBufferString.replace(/(-----(BEGIN|END) PRIVATE KEY-----|\r\n)/g, '');

		if (pKey.charAt(0) === "M") {
			cipheredKey = window.atob(pKey);
		}
		else {
			cipheredKey = privateKeyBufferString;
		}

		var certX509;
		var certificateBufferString = arrayBufferToString(certificateBuffer);
		var pCert = certificateBufferString.replace(/(-----(BEGIN|END) CERTIFICATE-----|\r\n)/g, '');

		if (pCert.charAt(0) === "M") {
			certX509 = window.atob(pCert);
		}
		else {
			certX509 = certificateBufferString;
		}

		try {
			//Getting password and data to sign
			var password = passwordRef.current;
			console.log(password);
			var hashToSign = document.getElementById("hashToSign").value;

			// Signing hash
			if (window.Promise) {
				var signPromise = pkcs7FromHash(password, cipheredKey, certX509, hashAlgorithm, hashToSign, true);

				signPromise.then(function (Signature) {
					document.getElementById("signature").innerHTML = Signature;
				}, function (error) {
					if (error.indexOf("Unexpected format or file") != -1) {
						var result1 = openOldKey(cipheredKey, password);

						if (result1.indexOf("Error") != -1) {
							alert("[SgDataCrypto] - " + result1);
							document.getElementById("signature").innerHTML = "";
						} else {

							result1 = signHash_2(hashToSign, hashAlgorithm, btoa(certX509), result1, password, true);

							if (result1.indexOf("Error") != -1) {
								alert("[SgDataCrypto] - " + result1);
								document.getElementById("signature").innerHTML = "";
							} else {
								document.getElementById("signature").innerHTML = result1;
							}
						}

					} else {
						alert("[SgDataCrypto] - " + error);
						document.getElementById("signature").innerHTML = "";
					}
				});
			} else {
				alert("Your current browser does not support Promises! This page will not work.");
			}
		} catch (err) {
			alert("[SgDataCrypto] - " + err.message + "\n" + err.stack);
		}
	} //End of signData 
	return (
		<div>
			<table>
				<tr>
				</tr>
			</table>
			<h3>Digital Signature PKCS7 From Hash (File Version)</h3>
			<h3>SgDataCrypto JS Lite v1.7 powered by SeguriData</h3>
			<table>
				<tr>
					<td>Private Key Password</td>
				</tr>
				<tr>
					<td><input type="password" id="password" size="64" /></td>
				</tr>
				<tr>
					<td>&nbsp;</td>
				</tr>
				<tr>
					<td style={titulo}>Private key file (Binary or B64)</td>
				</tr>
				<tr>
					<td><input type="file" accept=".key" id="privkey_file" title="Load private key file" onChange={e => handleParsingPrivKeyFile(e)} /></td>
				</tr>
				<tr>
					<td>&nbsp;</td>
				</tr>
				<tr>
					<td style={titulo}>Certificate file (Binary or B64)</td>
				</tr>
				<tr>
					<td><input type="file" accept=".cer" id="certificate_file" title="Load certificate file" onChange={e => handleParsingCertFile(e)} /></td>
				</tr>
				<tr>
					<td>&nbsp;</td>
				</tr>
				<tr>
					<td style={titulo}>Hash To Sign</td>
				</tr>
				<tr>
					<td><textarea id="hashToSign" cols="68" rows="4">VZrq0IJk1XldOQlxjN0Fq9SVcuhP5VWQ7vMaiKCP3/0=</textarea></td>
				</tr>
				<tr>
					<td>&nbsp;</td>
				</tr>
				<tr>
					<td style={titulo}>Hash Algorithm</td>
				</tr>
				<tr>
					<td>
						<select ref={hashRef} id="hashAlg">
							<option value="alg_SHA1">SHA-1</option>
							<option value="alg_SHA256" selected>SHA-256</option>
							<option value="alg_SHA384">SHA-384</option>
							<option value="alg_SHA512">SHA-512</option>
						</select>
					</td>
				</tr>
				<tr>
					<td>&nbsp;</td>
				</tr>

				<tr>
					<td style={titulo}>PKCS&num;7 (B64)</td>
				</tr>
				<tr>
					<td><textarea id="signature" cols="68" rows="4" readonly></textarea></td>
				</tr>
				<tr>
					<td>&nbsp;</td>
				</tr>
				<tr>
					<td><button name="button" onClick={signData}>Sign</button></td>
				</tr>
			</table>
		</div>
	);
}

export default Sign;