let $profileContainer = $('#profileContainer');
if ($profileContainer.length != 0) {
    $('#backButton').on("click", function (e) {
        e.preventDefault();
        window.history.back();
    });

    function getOneUser() {

        const baseUrl = 'http://ec2-52-22-178-234.compute-1.amazonaws.com:5000';

        let userId = localStorage.getItem('user_id');
        let role = localStorage.getItem('role_name');
        var token = localStorage.getItem('token');


        axios({
            headers: {
                'user': userId,
                'role': role,
                authorization: "Bearer " + token
            },
            method: 'get',
            url: baseUrl + '/api/user/' + userId,
        })
            .then(function (response) {
                //Using the following to inspect the response.data data structure
                //before deciding the code which dynamically populate the elements with data.
                console.dir(response.data);
                const record = response.data.userdata;
                $('#fullNameOutput').text(record.fullname);
                $('#emailOutput').text(record.email);
            })
            .catch(function (response) {
                //Handle error
                console.dir(response);
                new Noty({
                    type: 'error',
                    timeout: '6000',
                    layout: 'topCenter',
                    theme: 'sunset',
                    text: 'Unable retrieve profile data',
                }).show();

            });

    } //End of getOneUser
    //Call getOneUser function to do a GET HTTP request on an API to retrieve one user record
    getOneUser();
} //End of checking for $profileContainer jQuery object