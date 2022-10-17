/**
 * Debug msg handler.
 */
var _debug = function(msg) {
    var dbg = false;

    if (dbg) {
        console.log(msg);
    }
}

/**
 * Generate a key pair and place base64 encoded values into specified DOM elements.
 */
var genKeyPair = function() {

    // Get params from user input
    var name = $('#name').val();
    var email = $('#email').val();
    var bitlength = parseInt($('#bitlength').val());
    var algorithm = $('#algorithm').val();
    var expire = $('#expire').val();
    var passphrase = $('#passphrase').val();

    if (expire == "1") {
        var expire = 86400 * 365 * 1;
    } else if (expire == "2") {
        var expire = 86400 * 365 * 2;
    } else if (expire == "4") {
        var expire = 86400 * 365 * 4;
    } else if (expire == "8") {
        var expire = 86400 * 365 * 8;
    }

    // Set ECC flag
    var use_ecc = false;
    if (algorithm == 'ecc') {
        use_ecc = true;
    }

    var genBtn = $('#generate_keys_btn');
    (async () => {
        genBtn.val("در حال تولید کلید ها ...");
        genBtn.css('pointer-events', 'none');
        genBtn.addClass("disabled");
        const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
            type: use_ecc ? 'ecc' : 'rsa', // Type of the key, defaults to ECC
            rsaBits: bitlength,
            userIDs: [{ name: name, email: email }], // you can pass multiple user IDs
            passphrase: passphrase, // protects the private key
            keyExpirationTime: expire,
            subkeys: [{sign: true}, {sign: false}],
            format: 'armored' // output key format, defaults to 'armored' (other options: 'binary' or 'object')
        });

        $('#privkey').val(privateKey);
        $('#download_priv_key').removeClass('disabled');

        $('#pubkey').val(publicKey);
        $('#download_pub_key').removeClass('disabled');
        
        genBtn.removeClass("disabled");
        genBtn.removeClass("btn-primary").addClass("btn-success");
        genBtn.val("کلید ها تولید شدند");

        console.log(privateKey);     // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
        console.log(publicKey);      // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
        console.log(revocationCertificate); // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
    })();
}

/**
 * Populate dropdown key size menu.
 */

var populateKeysizeDropdown = function() {

    /* Accepted RSA key sizes */
    rsa_bitlengths = [{
            "value": "",
            "class": "disabled",
            "text": "Select key size...",
            "selected": "selected"
        },
        {
            "value": "1024",
            "class": null,
            "text": "1024 bits (good for testing purposes)",
            "selected": null
        },
        {
            "value": "2048",
            "class": null,
            "text": "2048 bits (secure)",
            "selected": null
        },
        {
            "value": "4096",
            "class": null,
            "text": "4096 bits (more secure) [Recommended]",
            "selected": null
        },
        {
            "value": "8192",
            "class": null,
            "text": "8192 bits (super secure, super slow)",
            "selected": null
        },
    ]

    /* Accepted ECC key sizes */
    ecc_bitlengths = [{
            "value": "",
            "class": "disabled",
            "text": "Select key size...",
            "selected": "selected"
        },
        //{"value": "163", "class":null, "text":"163 bits (good for testing purposes)", "selected":null},
        //{"value": "256", "class":null, "text":"256 bits (secure)", "selected":null},
        {
            "value": "384",
            "class": null,
            "text": "384 bits (secure)",
            "selected": null
        },
        //{"value": "512", "class":null, "text":"512 bits (even more secure)", "selected":null},
    ]

    /* Empty existing dropdown list */
    $("#bitlength > option").each(function() {
        $(this).remove();
    });

    /* Re-populate */
    var option_list = $("#bitlength");
    var picked_algorithm = $("#algorithm").val();
    var option;

    if (picked_algorithm == 'rsa') {
        $.each(rsa_bitlengths, function(index, option) {
            //console.log(option);
            $('<option />', {
                value: option['value'],
                text: option['text'],
                class: option['class'],
                selected: option['selected']
            }).appendTo(option_list);
        });
    } else if (picked_algorithm == 'ecc') {
        $.each(ecc_bitlengths, function(index, option) {
            //console.log(option);
            $('<option />', {
                value: option['value'],
                text: option['text'],
                class: option['class'],
                selected: option['selected']
            }).appendTo(option_list);
        });
    }
}

/**
 * Download public key as a base64 encoded value.
 */
var downloadPubKey = function() {

    var blob = new Blob([$('#pubkey').val()], {
        type: "text/plain;charset=utf-8"
    });
    saveAs(blob, "pubKey.asc");

    return false;
}

/**
 * Download private key as a base64 encoded value.
 */
var downloadPrivKey = function() {

    var blob = new Blob([$('#privkey').val()], {
        type: "text/plain;charset=utf-8"
    });
    saveAs(blob, "privKey-secret.asc");

    return false;
}