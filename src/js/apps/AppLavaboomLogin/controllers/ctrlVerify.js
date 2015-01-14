angular.module('AppLavaboomLogin').controller('VerifyController', function($scope, LavaboomAPI,$state) {
$scope.invite=[];
    $scope.verifyInvite = function() {
        LavaboomAPI.accounts.create.classic({
            "username": $scope.invite.username,
            "password": CryptoJS.SHA3('123', {outputLength: 256}).toString(),
            "email": '123'
        })
          /*"username": $scope.signUp.username,
           "password": CryptoJS.SHA3($scope.signUp.password, { outputLength: 256 }).toString(),
           "email": $scope.signUp.email*/
          .then(function (resp) {
            console.log(resp);
              LavaboomAPI.tokens.create({
                  "token":"",
                  "type":"auth",
                  "username": $scope.invite.username,
                  "password":  CryptoJS.SHA3("123", { outputLength: 256 }).toString()
              }).then(function (data) {
                  LavaboomAPI.setAuthToken(data.token.id);
              }).catch(function (err) {
                  console.log(err);
              });
              $state.on('plan');
              }).catch(function (err) {
            console.log(err);
        });
    };
    $scope.invite.fistName='';
    $scope.invite.lastName='';
    $scope.displayCreate=function(){
        $scope.invite.displayName = $scope.invite.firstName + $scope.invite.lastName;
    };
    $scope.setDetails = function(){
        LavaboomAPI.accounts.update('me',{'current_password': CryptoJS.SHA3("123", { outputLength: 256 }).toString(),'settings': {'full_name': $scope.invite.firstName+" "+$scope.invite.lastName,'display_name':$scope.invite.displayName}}).then(function (resp) {
            console.log(resp);
            $state.on('choosePasswordIntro');
        }).catch(function (err) {
            console.log(err);
            // $location.url('choosePasswordIntro');
        });
    };
    $scope.updatePassword = function(){
       LavaboomAPI.accounts.update('me',{'current_password': CryptoJS.SHA3("123", { outputLength: 256 }).toString(),'new_password':CryptoJS.SHA3($scope.invite.password, { outputLength: 256 }).toString()}).then(function (resp) {
            console.log(resp);
           $state.on('generateKeys');
        }).catch(function (err) {
            console.log(err);
          // $location.url('generateKeys');
        });
    };

});