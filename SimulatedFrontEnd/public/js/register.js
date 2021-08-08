localStorage.clear();

let $registerFormContainer = $('#registerFormContainer');
if ($registerFormContainer.length != 0) {
    //If the jQuery object which represents the form element exists,
    //the following code will create a method to submit registration details
    //to server-side api when the #submitButton element fires the click event.
    $('#submitButton').on('click', function (event) {
        event.preventDefault();
        const baseUrl = 'http://ec2-52-22-178-234.compute-1.amazonaws.com:5000';
        let fullName = $('#fullNameInput').val();
        let email = $('#emailInput').val();
        let password = $('#passwordInput').val();
        if (fullName == "" && email == "" && password == "") {
            new Noty({
                timeout: '6000',
                type: 'error',
                layout: 'topCenter',
                theme: 'sunset',
                text: 'Please fill in all the credentials.',
            }).show();
            return;
        }
        let webFormData = new FormData();
        webFormData.append('fullName', fullName);
        webFormData.append('email', email);
        webFormData.append('password', password);
        axios({
            method: 'post',
            url: baseUrl + '/api/user/register',
            data: webFormData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(function (response) {
                //Handle success
                console.dir(response);
                new Noty({
                    type: 'success',
                    timeout: '6000',
                    layout: 'topCenter',
                    theme: 'bootstrap-v4',
                    text: 'You have registered. Please <a href="login.html" class=" class="btn btn-default btn-sm" >Login</a>',
                }).show();
            })
            .catch(function (response) {
                console.log(response);
                if (response.response.data.Message == "Incorrect format") {
                    new Noty({
                        timeout: '6000',
                        type: 'error',
                        layout: 'topCenter',
                        theme: 'sunset',
                        text: 'Your inputs are in the wrong format.',
                    }).show();
                } else {
                    //Handle error
                    console.dir(response);
                    new Noty({
                        timeout: '6000',
                        type: 'error',
                        layout: 'topCenter',
                        theme: 'sunset',
                        text: 'Unable to register.',
                    }).show();
                }
            });
    });

} //End of checking for $registerFormContainer jQuery object