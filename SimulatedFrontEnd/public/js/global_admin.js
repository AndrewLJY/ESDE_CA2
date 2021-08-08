var userid = localStorage.getItem('user_id');
var role = localStorage.getItem('role_name');
var token = localStorage.getItem('token');
const baseUrl = 'http://ec2-52-22-178-234.compute-1.amazonaws.com:5000';
const assignUrl = 'http://3.214.213.44:3001';

if (userid == null || role == null || token == null) {
    window.location.assign(assignUrl + "/login.html");
}

// TO CHECK IF THE ID AND ROLE IN LOCAL STORAGE IS THE SAME AS THE ONES IN TOKEN
axios({
    method: 'post',
    url: baseUrl + '/api/user/frontauthenticate',
    headers: { 'user': userid, authorization: "Bearer " + token }

}).then(function (response) {

    if (userid != response.data.userId || role != response.data.role) {
        localStorage.setItem('user_id', response.data.userId);
        localStorage.setItem('role_name', response.data.role);
        if (response.data.role == "user") {
            window.location.assign(assignUrl + "/user/manage_submission.html");
        }
        location.reload();

    } else {

        // TO CHECK IF YOUR ROLE IS THE SAME AS THE URL YOU ARE TRYING TO ENTER
        axios({
            method: 'get',
            url: baseUrl + '/api/user/getuserRolefromUserID/' + userid,
            headers: {
                'user': userid,
                'role': role,
                authorization: "Bearer " + token
            }

        }).then(function (response) {
            
            if (response.data.role != "admin") {
                alert("Unauthorized Access!");
                window.location.assign(assignUrl + "/user/manage_submission.html");

            }
        }).catch(function (err) {
            window.location.assign(assignUrl + "/login.html");

        })
    }
}).catch(function (err) {
    window.location.assign(assignUrl + "/login.html");

})

$('#logoutButton').on('click', function (event) {
    event.preventDefault();
    localStorage.clear();
    window.location.replace('/home.html');
});