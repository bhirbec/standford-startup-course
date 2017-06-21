// Google Doc Web Signin: 'https://www.googleapis.com/auth/contacts.readonly'
// TODO: verify the app (https://support.google.com/code/contact/oauth_app_verification)

const scopes = `
    https://www.googleapis.com/auth/userinfo.email
    https://www.googleapis.com/auth/userinfo.profile
    https://www.googleapis.com/auth/plus.me
`

function signout() {
    firebase.auth().signOut().catch(function(error) {
        console.log("An error occured while signing out of Firebase", error)
    });
}

function signin(googleUser) {
    console.log('Signin in Firebase with Google user', googleUser);

    // Check if we are already signed-in Firebase with the correct user?
    let fbUser = firebase.auth().currentUser
    if (isUserEqual(googleUser, fbUser)) {
        return
    }

    // Sign in with credential from the Google user.
    let tokenId = googleUser.getAuthResponse().id_token
    var credential = firebase.auth.GoogleAuthProvider.credential(tokenId)
    let p = firebase.auth().signInWithCredential(credential)

    p.then(function(fbUser) {
        console.log('Signed in Firebase', fbUser);
        let fb = firebase.database()

        fb.ref('profile/' + fbUser.uid + '/info').once('value').then(function (snap) {
            if (snap.exists()) {
                return
            }

            // TODO: get the profile server side (security)
            $.get("https://www.googleapis.com/oauth2/v1/userinfo", {
                alt: 'json',
                access_token: googleUser.Zi.access_token
            }).then(function (info) {
                info.uid = fbUser.uid
                fb.ref('profile/' + fbUser.uid + '/google-profile').set(info)
            })
        })
    }).catch(function(error) {
        console.log("An error occured while signing in Firebase", error)
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    })
}

function isUserEqual(googleUser, fbUser) {
    if (fbUser) {
        var providerData = fbUser.providerData;
        for (var i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
            providerData[i].uid === googleUser.getBasicProfile().getId()) {
                // We don't need to reauth the Firebase connection.
                return true;
            }
        }
    }
    return false;
}

export {signin, signout}
