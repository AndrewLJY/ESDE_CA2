let $searchDesignFormContainer = $('#searchUserFormContainer');
if ($searchDesignFormContainer.length != 0) {
    //If the jQuery object which represents the form element exists,
    //the following code will create a method to submit search parameters
    //to server-side api when the #submitButton element fires the click event.
    $('#submitButton').on('click', function (event) {
        event.preventDefault();
        const baseUrl = 'http://ec2-52-22-178-234.compute-1.amazonaws.com:5000';
        let searchInput = $('#searchInput').val();
        var userId = localStorage.getItem('user_id');
        let role = localStorage.getItem('role_name');
        let token = localStorage.getItem('token');

        axios({
            headers: {
                //Modify this will affect the checkUserFn.js middleware file at the backend.
                'user': userId,
                'role': role,
                authorization: "Bearer " + token
            },
            method: 'get',
            url: baseUrl + '/api/user/process-search-user/1/' + searchInput,
        })
            .then(function (response) {
                //Using the following to inspect the response.data data structure
                //before deciding the code which dynamically generates cards.
                //Each card describes a design record.
                //console.dir(response.data);
                const records = response.data.userdata;
                const totalNumOfRecords = response.data.total_number_of_records;
                //Find the main container which displays page number buttons
                let $pageButtonContainer = $('#pagingButtonBlock');
                //Find the main container which has the id, dataBlock
                let $dataBlockContainer = $('#dataBlock');
                $dataBlockContainer.empty();
                $pageButtonContainer.empty();
                if (records.length == 0) {
                    new Noty({
                        type: 'information',
                        layout: 'topCenter',
                        timeout: '5000',
                        theme: 'sunset',
                        text: 'No submission records found.',
                    }).show();
                }
                for (let index = 0; index < records.length; index++) {
                    let record = records[index];
                    let $card = $('<div></div>').addClass('card').attr('style', 'width: 18rem;');
                    let $cardBody = $('<div></div>').addClass('card-body');
                    $cardBody.append($('<h5></h5>').addClass('card-title').text(record.fullname));
                    $editUserButtonBlock = $('<div></div>').addClass('col-md-2 float-right');
                    $editUserButtonBlock.append($('<a>Manage</a>').addClass('btn btn-primary').attr('href', 'update_user.html?id=' + record.user_id));
                    $cardBody.append($editUserButtonBlock);

                    $cardBody.append($('<p></p>').addClass('card-text').text(record.email));
                    if (record.role_name == 'admin') {
                        $cardBody.append($('<img></img>').attr({ 'src': '../images/admin.png', 'widthc': '50' }).addClass('text-right'));
                    }
                    $card.append($cardBody);
                    //After preparing all the necessary HTML elements to describe the user data,
                    //I used the code below to insert the main parent element into the div element, dataBlock.
                    $dataBlockContainer.append($card);
                    $dataBlockContainer.append($('<h5></h5>'));
                } //End of for loop
                let totalPages = Math.ceil(totalNumOfRecords / 4);

                for (let count = 1; count <= totalPages; count++) {

                    let $button = $(`<button class="btn btn-primary btn-sm" />`);
                    $button.text(count);
                    $button.click(clickHandlerForPageButton);

                    $pageButtonContainer.append($button);
                } //End of for loop to add page buttons

            }).catch(function (response) {
                if (response.response.data.message == "Unauthorized Access") {
                    localStorage.setItem('user_id', response.response.data.userid)
                    localStorage.setItem('role_name', response.response.data.userrole)
                    // window.location.assign("http://localhost:3001/user/manage_submission.html");

                } else {
                    //Handle error
                    console.dir(response);
                    new Noty({
                        type: 'error',
                        layout: 'topCenter',
                        timeout: '5000',
                        theme: 'sunset',
                        text: 'Unable to search',
                    }).show();
                }
            });
    });

    function clickHandlerForPageButton(event) {
        event.preventDefault();
        const baseUrl = 'http://ec2-52-22-178-234.compute-1.amazonaws.com:5000';
        let userId = localStorage.getItem('user_id');
        let role = localStorage.getItem('role_name');
        let token = localStorage.getItem('token');
        let pageNumber = $(event.target).text().trim();
        let searchInput = $('#searchInput').val();
        axios({
            headers: {
                'user': userId,
                'role': role,
                authorization: "Bearer " + token
            },
            method: 'get',
            url: baseUrl + '/api/user/process-search-user/' + pageNumber + '/' + searchInput,
        })
            .then(function (response) {
                //Using the following to inspect the response.data data structure
                //before deciding the code which dynamically generates cards.
                //Each card describes a design record.
                //console.dir(response.data);
                const records = response.data.userdata;
                const totalNumOfRecords = response.data.total_number_of_records;
                //Find the main container which displays page number buttons
                let $pageButtonContainer = $('#pagingButtonBlock');
                //Find the main container which has the id, dataBlock
                let $dataBlockContainer = $('#dataBlock');
                $dataBlockContainer.empty();
                $pageButtonContainer.empty();
                for (let index = 0; index < records.length; index++) {
                    let record = records[index];
                    let $card = $('<div></div>').addClass('card').attr('style', 'width: 18rem;');
                    let $cardBody = $('<div></div>').addClass('card-body');
                    $cardBody.append($('<h5></h5>').addClass('card-title').text(record.fullname));
                    $editUserButtonBlock = $('<div></div>').addClass('col-md-2 float-right');
                    $editUserButtonBlock.append($('<a>Manage</a>').addClass('btn btn-primary').attr('href', 'update_user.html?id=' + record.user_id));
                    $cardBody.append($editUserButtonBlock);
                    $cardBody.append($('<p></p>').addClass('card-text').text(record.email));
                    if (record.role_name == 'admin') {
                        $cardBody.append($('<img></img>').attr({ 'src': '../images/admin.png', 'widthc': '50' }).addClass('text-right'));
                    }
                    $card.append($cardBody);
                    //After preparing all the necessary HTML elements to describe the file data,
                    //I used the code below to insert the main parent element into the div element, dataBlock.
                    $dataBlockContainer.append($card);
                    $dataBlockContainer.append($('<h5></h5>'));
                } //End of for loop
                let totalPages = Math.ceil(totalNumOfRecords / 4);
                for (let count = 1; count <= totalPages; count++) {

                    $pageButtonContainer.append($('<button class="btn btn-primary btn-sm"></button>').text(count).on('click', clickHandlerForPageButton));
                }
            })
            .catch(function (response) {
                //Handle error
                console.dir(response);
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    theme: 'sunset',
                    text: 'Unable to search',
                }).show();
            });

    } //End of clickHandlerForPageButton
} //End of checking for $searchUserFormContainer jQuery object