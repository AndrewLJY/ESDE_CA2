localStorage.clear();

let $loginFormContainer = $('#loginFormContainer');
if ($loginFormContainer.length != 0) {

    //If the jQuery object which represents the form element exists,
    //the following code will create a method to submit registration details
    //to server-side api when the #submitButton element fires the click event.
    $('#submitButton').on('click', function (event) {
        event.preventDefault();
        const baseUrl = 'http://ec2-52-22-178-234.compute-1.amazonaws.com:5000';
        let email = $('#emailInput').val();
        let password = $('#passwordInput').val();
        let webFormData = new FormData();
        console.log("damn it over here");
        webFormData.append('email', email);
        webFormData.append('password', password);
        axios({
            method: 'post',
            url: baseUrl + '/api/user/login',
            data: webFormData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(function (response) {
                //Inspect the object structure of the response object.

                userData = response.data;
                if (userData.role_name == 'user') {
                    localStorage.setItem('token', userData.token);
                    localStorage.setItem('user_id', userData.user_id);
                    localStorage.setItem('role_name', userData.role_name);
                    window.location.replace('user/manage_submission.html');
                    return;
                }
                if (response.data.role_name == 'admin') {
                    localStorage.setItem('token', userData.token);
                    localStorage.setItem('user_id', userData.user_id);
                    localStorage.setItem('role_name', userData.role_name);
                    window.location.replace('admin/manage_users.html');
                    return;
                }
            })
            .catch(function (response) {
                //Handle error
                console.dir(response);
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    theme: 'sunset',
                    timeout: '6000',
                    text: 'Unable to login. Check your email and password',
                }).show();

            });
    });

} //End of checking for $loginFormContainer jQuery object
