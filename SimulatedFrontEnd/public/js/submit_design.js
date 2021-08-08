let $submitDesignFormContainer = $('#submitDesignFormContainer');
if ($submitDesignFormContainer.length != 0) {
    //If the jQuery object which represents the form element exists,
    //the following code will create a method to submit design details
    //to server-side api when the #submitButton element fires the click event.
    $('#submitButton').on('click', function (event) {
        event.preventDefault();
        const baseUrl = 'http://ec2-52-22-178-234.compute-1.amazonaws.com:5000';
        let userId = localStorage.getItem('user_id');
        let role = localStorage.getItem('role_name');
        let token = localStorage.getItem('token');
        let designTitle = $('#designTitleInput').val();
        let designDescription = $('#designDescriptionInput').val();
        let webFormData = new FormData();
        webFormData.append('designTitle', designTitle);
        webFormData.append('designDescription', designDescription);

        // HTML file input, chosen by user
        let fileData = document.getElementById('fileInput').files[0];
        webFormData.append("file", fileData);
        webFormData.append("file_name", fileData.name);
        
        axios({
            method: 'post',
            url: baseUrl + '/api/user/process-submission',
            data: webFormData,
            headers: {
                'Content-Type': 'multipart/form-data',
                'user': userId,
                'role': role,
                authorization: "Bearer " + token
            }
        })
            .then(function (response) {
                Noty.overrideDefaults({
                    callbacks: {
                        onTemplate: function () {
                            if (this.options.type === 'systemresponse') {
                                this.barDom.innerHTML = '<div class="my-custom-template noty_body">';
                                this.barDom.innerHTML += '<div class="noty-header">Message</div>';
                                this.barDom.innerHTML += '<p class="noty-message-body">' + this.options.text + '</p>';
                                this.barDom.innerHTML += '<img src="' + this.options.imageURL + '">';
                                this.barDom.innerHTML += '<div>';
                            }
                        }
                    }
                })

                new Noty({
                    type: 'systemresponse',
                    layout: 'topCenter',
                    timeout: '5000',
                    text: response.data.message,
                    imageURL: response.data.imageURL
                }).show();
            })
            .catch(function (response) {
                if (response.response.data.message == "Unauthorized Access") {
                    localStorage.setItem('user_id', response.response.data.userid)
                    localStorage.setItem('role_name', response.response.data.userrole)
                    window.location.assign("http://localhost:3001/user/manage_submission.html");

                } else if (response.response.data.message == "Invalid design title and description.") {
                    new Noty({
                        timeout: '6000',
                        type: 'error',
                        layout: 'topCenter',
                        theme: 'sunset',
                        text: 'Please enter valid design title, description or both.',
                    }).show();
                }
                else if (response.response.status == 415) {
                    new Noty({
                        timeout: '6000',
                        type: 'error',
                        layout: 'topCenter',
                        theme: 'sunset',
                        text: 'Invalid file type!',
                    }).show();
                } 
                else {
                    //Handle error
                    console.dir(response);
                    new Noty({
                        type: 'error',
                        timeout: '6000',
                        layout: 'topCenter',
                        theme: 'sunset',
                        text: 'Unable to submit design file.',
                    }).show();
                }
            });
    });

} //End of checking for $submitDesignFormContainer jQuery object