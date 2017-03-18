(function () {
    var db;
    var os;
    var classdate;
    var app = angular.module('starter', ['ionic','chart.js','ionic-color-picker','ngCordova','jett.ionic.filter.bar','formlyIonic','angularMoment']);
    app.run(function ($ionicPlatform, $cordovaSQLite,$cordovaFile) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
        
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            if (window.cordova) {
                 db = $cordovaSQLite.openDB({name: "attend1", location: 1}); 
                  db = window.openDatabase("attend", "1.0", "sqlite", 1024 * 1024 * 100); 
                 } 
        
            $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS course (id INTEGER PRIMARY KEY AUTOINCREMENT, courseid text, coursename text, alias text, section text, pic text)");
            $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS student(id integer primary key AUTOINCREMENT, stdid text, stdnamelastnameThai text, cstu_index integer)");
            $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS class(id integer primary key AUTOINCREMENT, datestime text, ccla_index integer, note text default '')");
            $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS status(id integer primary key AUTOINCREMENT, statusname text, csta_index integer, color text,calpresent integer)");

            
      });
    });
    app.config(function ($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
        $ionicConfigProvider.navBar.alignTitle('center');
        $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: 'templates/home.html',
                    controller: 'homeCtrl'
                })
                .state('course',{
                    url:'/course/:id',
                    templateUrl:'templates/course.html',
                    controller: 'courseCtrl'
                })
                .state('course.students',{
                  url:'/students',
                  controller: 'courseCtrl',
                  views:{
                    'tab-students':{
                    templateUrl: 'templates/students.html'
                    }
                  }
                })
                .state('course.occurrence',{
                  url:'/occurrence',
                  controller: 'courseCtrl',
                  views:{
                    'tab-occurrence':{
                    templateUrl: 'templates/occurrence.html'
                    }
                  }
                })
                .state('course.classattend',{
                  url:'/classattend',
                  controller: 'courseCtrl',
                  views:{
                    'tab-class':{
                    templateUrl: 'templates/classattend.html'
                    }
                  }
                })
                .state('eachclass',{
                    url:'/eachclass/:id/:datestimeid/:datestimevalue',
                    templateUrl:'templates/eachclass.html',
                    controller: 'CheckclassCtrl'
                })
                .state('selectreport',{
                    url:'/selectreport/:id',
                    templateUrl:'templates/selectreport.html',
                    controller: 'courseCtrl'
                })
                .state('reportbyperiod',{
                    url:'/reportbyperiod/:id',
                    templateUrl:'templates/reportbyperiod.html',
                    controller: 'courseCtrl'
                })
                .state('reportbyperson',{
                    url:'/reportbyperson/:id',
                    templateUrl:'templates/reportbyperson.html',
                    controller: 'reportCtrl'
                });
    
          $ionicConfigProvider.tabs.position('bottom');

        $urlRouterProvider.otherwise('home');



    });
    app.controller('homeCtrl', function ($rootScope,$ionicPlatform,$state,$ionicLoading,$scope, $cordovaSQLite, $ionicModal, $ionicFilterBar, $timeout, $ionicPopup,$location,$ionicPopover,$ionicHistory) {
        
        var change = false;
        $scope.post = {};
        $scope.put = {};
        var filterBarInstance;
        $scope.show = function() {
             $ionicLoading.show({
                 template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                 });
         };

        $scope.hide = function(){
        $ionicLoading.hide();
         };
        
        $ionicPlatform.registerBackButtonAction(function (event) {   
                if($state.current.name=="home"){
                        var confirmPopup = $ionicPopup.confirm({
                        title: 'ออกจากโปรแกรม',
                        template: 'คุณต้องการออกจากโปรแกรมใช่หรือไม่'
                            });
                                confirmPopup.then(function(res) {
                                   if(res) {
                                        navigator.app.exitApp();
                                   } else {
                                        //console.log('You are not sure');
                                   }
                                 });   
                  }
                  else {
                        navigator.app.backHistory();

                  }
                }, 100);

        $ionicPlatform.ready(function () {
                getList();
               
            });

        $ionicPopover.fromTemplateUrl('templates/popovercourse.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popCourse = popover;
        });
        $scope.closeCourse = function () {
            $scope.popCourse.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.popCourse.remove();
        });
           

            $scope.getOpt = function(option){
                  return option.statusname + ":" + option.id + option.cid + option.color ;
             };
           
            $scope.selectedItemChanged = function(item){
                
              };
                  
            $scope.shoutLoud = function(newValuea, oldValue){
                alert("changed from " + JSON.stringify(oldValue) + " to " + JSON.stringify(newValuea));
              };

        $scope.add = function () {
            $scope.number = parseInt((Math.random() * (10 - 1 + 1)), 10) + 1;
            $scope.post.pic = "img/image"+$scope.number+".png";
            
            var data = [];
            angular.forEach($scope.post, function (element) {
                data.push(element);
            });
            //check
            var querycheck = "SELECT * FROM course where courseid = ? and section = ?";
            $cordovaSQLite.execute(db, querycheck , [$scope.post.courseid,$scope.post.section]).then(function (res) {

                    if(res.rows.length == 0){
                    var query = "INSERT INTO course (courseid,coursename,alias,section,pic) VALUES (?,?,?,?,?)";
                    $cordovaSQLite.execute(db, query, data).then(function (resin) {
                        $ionicPopup.alert({
                            title: "ข้อความ",
                            template: "เพิ่มรายวิชาเรียบร้อยแล้วค่ะ",
                            buttons: [
                            {
                              text: '<b>ตกลง</b>',
                              type: 'button-positive',
                              onTap: function() {
                              $scope.closeAdd();
                              }
                            }
                            ]
                        });
                        
                        createTable(resin.insertId);
                        $scope.post = {};
                        getList();

                    }, function (err) {
                        console.log(err.message);
                    });
                    }
                    else
                    {
                        $ionicPopup.alert({
                            title: "ข้อความ",
                            template: "มีข้อมูลวิชาและกลุ่มแล้ว",
                            buttons: [
                            {
                              text: '<b>ตกลง</b>',
                              type: 'button-positive',
                              onTap: function() {
                           
                              }
                            }
                            ]
                        });

                    }
            }, function (err) {
                console.log(err.message);
            });
            
        };
        
        $scope.edit = function () {
            if($scope.put.courseid == $scope.initial.courseid && $scope.put.section == $scope.initial.section)
            {
            var query = "update course set courseid = ?,coursename=?,alias=?, section =? where id=?";
            $cordovaSQLite.execute(db, query, [
                $scope.put.courseid,
                $scope.put.coursename,
                $scope.put.alias,
                $scope.put.section,
                $scope.put.id
            ]).then(function () {
                $ionicPopup.alert({
                    title: "ข้อความ",
                    template: "แก้ไขรายวิชาเรียบร้อยแล้วค่ะ",
                    scope: $scope,
                    buttons: [
                    {
                      text: '<b>ตกลง</b>',
                      type: 'button-positive',
                      onTap: function() {
                      change = true;
                      $scope.closeEditbtt();
                      }
                    }
                    ]
                });
                getList();
            }, function (err) {
                console.log(err.message);
            });
            }else
            {
            var querycheck = "SELECT * FROM course where courseid = ? and section = ?";
            $cordovaSQLite.execute(db, querycheck , [$scope.put.courseid,$scope.put.section]).then(function (res) {
            if(res.rows.length == 0){
            var query = "update course set courseid = ?,coursename=?,alias=?, section =? where id=?";
            $cordovaSQLite.execute(db, query, [
                $scope.put.courseid,
                $scope.put.coursename,
                $scope.put.alias,
                $scope.put.section,
                $scope.put.id
            ]).then(function () {
                $ionicPopup.alert({
                    title: "ข้อความ",
                    template: "แก้ไขรายวิชาเรียบร้อยแล้วค่ะ",
                    scope: $scope,
                    buttons: [
                    {
                      text: '<b>ตกลง</b>',
                      type: 'button-positive',
                      onTap: function() {
                      //$scope.datas()
                      change = true;
                      $scope.closeEditbtt();
                      }
                    }
                    ]
                });
                getList();
            }, function (err) {
                console.log(err.message);
            });
        }
            else
            {
                  $ionicPopup.alert({
                            title: "แจ้งเตือน",
                            template: "มีข้อมูลวิชาและกลุ่มอยู่แล้ว",
                            buttons: [
                            {
                              text: '<b>ตกลง</b>',
                              type: 'button-positive',
                              onTap: function() {
                           
                              }
                            }
                            ]
                        });

            }
            }, function (err) {
                console.log(err.message);
            });

            }

        };
        
        function getList() {
             //$scope.show($ionicLoading);
             $scope.datacourse = false;
             $scope.showcourse = true;
             $cordovaSQLite.execute(db, 'SELECT * FROM course').then(function (res) {
                $scope.dataco = [];
                if (res.rows.length > 0)
                {
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.dataco.push(res.rows.item(i));
                }
                }else
                {

                     $scope.showcourse = false;
                    
                }
                $scope.datacourse = true;
                 

            }, function (err) {
                console.log(err.message);
                $scope.datacourse = true;
                 
            });
            $scope.hide($ionicLoading); 
        };

        function createTable(c_id) {
                var query1 = "CREATE TABLE course_"+c_id + " (idc INTEGER PRIMARY KEY AUTOINCREMENT, stdindex_rec integer, course_index integer, datestimeindex integer,statusindex integer)";
                $cordovaSQLite.execute(db,query1).then(function (res) {
                insertStatus(c_id);
            }, function (err) {
                console.log(err.message);
            });
            
        };

        function insertStatus(id) {
            $cordovaSQLite.execute(db, "INSERT INTO status (statusname, csta_index, color, calpresent) VALUES (?,?,?,?)", ["มา", id,"#006400",1]);
            $cordovaSQLite.execute(db, "INSERT INTO status (statusname, csta_index, color, calpresent) VALUES (?,?,?,?)", ["ขาด", id,"#dc143c",0]);
            $cordovaSQLite.execute(db, "INSERT INTO status (statusname, csta_index, color, calpresent) VALUES (?,?,?,?)", ["สาย", id,"#ff8c00",1]);
            $cordovaSQLite.execute(db, "INSERT INTO status (statusname, csta_index, color, calpresent) VALUES (?,?,?,?)", ["ลา", id,"#8b008b",1]);
            $cordovaSQLite.execute(db, "INSERT INTO status (statusname, csta_index, color, calpresent) VALUES (?,?,?,?)", ["ไม่ระบุ", id,"#0000ff",0]);
           
        };

        $ionicModal.fromTemplateUrl('templates/add.html', {
            scope: $scope,
            hardwareBackButtonClose: false
        }).then(function (modal) {
            $scope.modalAdd = modal;
        });
        $ionicModal.fromTemplateUrl('templates/addoccurrence.html', {
            scope: $scope,
            hardwareBackButtonClose: false
        }).then(function (modal) {
            $scope.modalAddoccurr = modal;
        });
        $ionicModal.fromTemplateUrl('templates/edit.html', {
            scope: $scope,
            hardwareBackButtonClose: false
        }).then(function (modal) {
            $scope.modalEdit = modal;
        });
       
        $scope.closeEdit = function () {
            $scope.put = angular.copy($scope.initial);
            $scope.modalEdit.hide();
        };
        $scope.closeEditbtt = function () {
            $scope.modalEdit.hide();
        };
        $scope.closeAdd = function () {
             $scope.post = {};
            $scope.modalAdd.hide();
        };
        $scope.closeAddoccur = function () {
            $scope.modalAddoccurr.hide();
        };
        $scope.goAdd = function () {
            $scope.modalAdd.show();
        };
        $scope.goAddoccurr = function () {
            $scope.modalAddoccurr.show();
        };
        $scope.showFilterBar = function () {
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.datas,
                update: function (filteredItems) {
                    $scope.datas = filteredItems;
                    //$scope.change = false;
                },cancel : function () {
                    getList();
                }
            });
        };
        $scope.$on('$destroy', function() {
        $scope.modalEdit.remove();
        $scope.modalAdd.remove();
        });


        $scope.refreshItems = function () {
            if (filterBarInstance) {
                filterBarInstance();
                filterBarInstance = null;
            }
            $timeout(function () {
                getList();
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };

        $scope.click = function(data){
            
            //$scope.show($ionicLoading);
            $scope.link = "#/course/" + data.id + "/students"; 
            //$scope.link = "#/course/" + data.id + "/" + data.courseid + "/" + data.section + "/" +data.alias; 
            window.location.href= $scope.link;
            //$ionicHistory.clearCache().then(function(){ window.location.href= $scope.link; });
            
        };


        $scope.editCourse = function(data){
          $scope.initial =  data;
          $scope.put = angular.copy($scope.initial);
          $scope.modalEdit.show();
        };

        $scope.deleteCourse = function(data){
        
          $ionicPopup.show({
                title: 'ยืนยันการลบ',
                template: "คุณแน่ใจที่จะลบรายวิชานี้ใช่หรือไม่",
                buttons: [
                    {
                        text: 'ตกลง',
                        type: 'button-positive',
                        onTap: function () {
                            var q1 = "DROP TABLE course_"+ data.id;
                            $cordovaSQLite.execute(db, q1);
                            var q2 = "DELETE FROM class where ccla_index  = ? ";
                            $cordovaSQLite.execute(db, q2, [data.id]);
                            var q3 = "DELETE FROM student where cstu_index  = ?";
                            $cordovaSQLite.execute(db, q3, [data.id]);
                            var q4 = "DELETE FROM course where id = ?";
                            $cordovaSQLite.execute(db, q4, [data.id]);
                             var q5 = "DELETE FROM status where csta_index = ?";
                            $cordovaSQLite.execute(db, q5, [data.id]);
                            change = true;
                            getList();

                        }
                    },
                    {
                        text: 'ยกเลิก',
                        type: 'button-assertive',
                        onTap: function () {
                            //$scope.modalEdit.show();
                        }
                    }
                ]
            });
        };

          $scope.deleteAllCourse = function(){
            $scope.closeCourse();
            if($scope.dataco.length === 0){
                $ionicPopup.show({
                    title: 'ข้อความ',
                    template: "ขณะนี้ไม่มีรายวิชาให้ลบ",
                    buttons: [
                        {
                            text: 'ตกลง',
                            type: 'button-positive',
                            onTap: function () {
                            }
                        }
                    ]
                });
            }// end if
            else{
                $ionicPopup.show({
                    title: 'ยืนยันการลบ',
                    template: "คุณแน่ใจที่จะลบรายวิชาทั้งหมดนี้ใช่หรือไม่",
                    buttons: [
                        {
                            text: 'ตกลง',
                            type: 'button-positive',
                            onTap: function () {
                                for (var i = 0; i < $scope.dataco.length; i++) {
                                    //alert($scope.datas[i].id);
                                    var q1 = "DROP TABLE course_"+ $scope.dataco[i].id;
                                    $cordovaSQLite.execute(db, q1);
                                    var q2 = "DELETE FROM class where ccla_index = ?";
                                    $cordovaSQLite.execute(db, q2, [$scope.dataco[i].id]);
                                    var q3 = "DELETE FROM student where cstu_index = ?";
                                    $cordovaSQLite.execute(db, q3, [$scope.dataco[i].id])
                                    var q4 = "DELETE FROM course where id = ?";
                                    $cordovaSQLite.execute(db, q4, [$scope.dataco[i].id])
                                    var q5 = "DELETE FROM status where csta_index = ?";
                                    $cordovaSQLite.execute(db, q5, [$scope.dataco[i].id])
                                }
                                        $scope.datas =[];
                                        $scope.dataco =[];
                                        $scope.dataoccurr=[];
                                        $scope.dataClass = [];
                                        $scope.alldatas =[];

                                getList();

                            }
                        },
                        {
                            text: 'ยกเลิก',
                            type: 'button-assertive',
                            onTap: function () {
                                //$scope.modalEdit.show();
                            }
                        }
                    ]
                });
            } // end else
        
    };
    $scope.Reset = function(){
        $scope.closeCourse();
        $ionicPopup.show({
                    title: 'ยืนยันการรีเซต',
                    template: "คุณแน่ใจที่จะรีเซตข้อมูลทั้งหมดเหมือนตอนเริ่มต้นเปิดโปรแกรมใช่หรือไม่",
                    buttons: [
                        {
                            text: 'ตกลง',
                            type: 'button-positive',
                            onTap: function () {
                            $scope.show($ionicLoading);
                            var q1 = "DROP TABLE student";
                            $cordovaSQLite.execute(db, q1).then(function () {
                            var q2 = "DROP TABLE status";
                            $cordovaSQLite.execute(db, q2).then(function () {
                             var q3 = "DROP TABLE class";
                            $cordovaSQLite.execute(db, q3).then(function () {  
                            $cordovaSQLite.execute(db, 'SELECT * FROM course').then(function (res) {
                                for (var i = 0; i < res.rows.length; i++) {
                                    var q4 = "DROP TABLE course_"+ res.rows.item(i).id;
                                    $cordovaSQLite.execute(db, q4);
                                }

                                var q1 = "DROP TABLE course";
                                 $cordovaSQLite.execute(db, q1);
        
                                                            $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS course (id INTEGER PRIMARY KEY AUTOINCREMENT, courseid text, coursename text, alias text, section text, pic text)");
                                                            $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS student(id integer primary key AUTOINCREMENT, stdid text, stdnamelastnameThai text, cstu_index integer)");
                                                            $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS class(id integer primary key AUTOINCREMENT, datestime text, ccla_index integer, note text text default '')");
                                                            $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS status(id integer primary key AUTOINCREMENT, statusname text, csta_index integer, color text,calpresent integer)");
                                                            $ionicHistory.clearCache();
                                                            $scope.datas =[];
                                                            $scope.dataco =[];
                                                            $scope.dataoccurr=[];
                                                            $scope.dataClass = [];
                                                            $scope.alldatas =[];
                                                            


                                 getList();

                                $scope.hide($ionicLoading);

                            }, function (err) {
                                    console.log(err.message);
                                    $scope.hide($ionicLoading);
                            });

                             

                             }, function (err) {
                                console.log(err.message);
                             });
                             
                             }, function (err) {
                                console.log(err.message);
                             });
                            
                            }, function (err) {
                                console.log(err.message);
                             });

                    
                            }
                        },
                        {
                            text: 'ยกเลิก',
                            type: 'button-assertive',
                            onTap: function () {
                                //$scope.modalEdit.show();
                            }
                        }
                    ]
                });
    };

        $scope.goBack = function() {
            //DF = window.plugins.deviceFeedback;
            //DF.haptic(DF.VIRTUAL_KEY);
            navigator.vibrate(40);
            $state.go('home');
        };
          $scope.showFilterBarcourse = function () {
             change = false;
            $scope.closeCourse();
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.dataco,
                update: function (filteredItems) {
                    $scope.dataco = filteredItems;
                    if(change)
                    {
                        getList();
                    }
                },cancel : function () {
                    if(change)
                    {
                        getList();
                    }
                }
            });
        };

    }); //end controller

  // Add Student and Check Class Attandance.
    app.controller('courseCtrl',function ($state,$ionicPlatform,$ionicSideMenuDelegate,$ionicLoading,$scope,$filter,$ionicListDelegate,$http,$cordovaSQLite,$cordovaFile,$cordovaVibration, $ionicModal,$ionicPopover, $ionicFilterBar, $timeout, $ionicPopup,$location,$cordovaDatePicker,$ionicPlatform,$ionicHistory,$ionicScrollDelegate){
        $scope.isDisabled = true;
        $scope.popStatuscolor="";
        $scope.dataStatusprepare = [];
        $scope.dataoccurr = [];
        $scope.cid = $state.params.id;
        $scope.selectstatusname = $state.params.statusname;
        $scope.selectoccColor ="#0000ff";
        $scope.selectoccEditColor ="";
        $scope.datetimeeachclass="";
        $scope.datas = [];
        $scope.post = {};
        $scope.put = {};
        $scope.dataclassLoaded = false;
        
        var file ;
        var filterBarInstance;
        var idbutton = "";
        var changestd = false;
        var changeclass = false;
         $scope.show = function() {
             $ionicLoading.show({
                 template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                 });
         };

        $scope.hide = function(){
        $ionicLoading.hide();
         };
        
       $ionicPlatform.registerBackButtonAction(function (event) {   
                if($state.current.name=="course.students")
                  {
                      
                      $scope.goBack();
                      //alert("Back to วิชา")
                  
                  }
                if($state.current.name=="course.occurrence")
                  {
                      $scope.gotabStudent();
                      //alert("Back to นักเรียน")
                  
                  }
                  if($state.current.name=="course.classattend")
                  {
                      $scope.gotabStudent();
                      //alert("Back to สถานะ")
                  
                  }
                  if($state.current.name=="selectreport")
                  {
                      
                       //alert("selectreport");
                       $scope.goClassAttendfromReport();

                  }
                  if($state.current.name=="reportbyperiod")
                  {
                       //alert("reportbyperiod");
                        $scope.gotoreport();

                  }
                  
                }, 100);

        $ionicPlatform.ready(function () {
            
            getList();
            prepareStatus();
            getListClass();
            getoccurence();
           
        });

        $scope.chunkedData = function(arr) {
                      var newArr = "";
                      var resultsex = 0;
                        newArr = arr.slice(0, 3);
                        if(newArr == 'นาย')
                        {
                            resultsex = 1;
                        }
                        if(newArr == 'นาง')
                        {
                            resultsex = 2;
                        }
                        if(newArr == 'น.ส')
                        {
                            resultsex = 5;
                        }
                      newArr = arr.slice(0, 4);
                       if(newArr == 'ด.ช.')
                        {
                            resultsex = 3;
                        }
                        if(newArr == 'ด.ญ.')
                        {
                            resultsex = 4;
                        }
                        newArr = arr.slice(0, 7);
                       if(newArr == 'เด็กชาย')
                        {
                            resultsex = 7;
                        }
                        newArr = arr.slice(0,8);
                        if(newArr == 'เด็กหญิง')
                        {
                            resultsex = 8;
                        }
                     
                     return resultsex;
                };

        $scope.add = function () {            
            var data = [];
            $scope.post.cid = $scope.cid;
            angular.forEach($scope.post, function (element) {
                data.push(element);
            });
            
                 var check = false;                                       
                   for (var k= 0;k<$scope.datas.length;k++ )
                                    {

                                        if($scope.post.stdid == $scope.datas[k].stdid)
                                             {

                                                    check = true;
                                             }


                                 } // end for

            //
            if (!check)
            {
                    var query = "INSERT INTO student (stdid,stdnamelastnameThai,cstu_index) VALUES (?,?,?)";
                    $cordovaSQLite.execute(db, query, data).then(function () {
                        $ionicPopup.alert({
                            title: "ข้อความ",
                            template: "เพิ่มนักศึกษาเรียบร้อยแล้วค่ะ",
                            buttons: [
                            {
                              text: '<b>ตกลง</b>',
                              type: 'button-positive',
                              onTap: function() {
                              $scope.closeAdd();
                              }
                            }
                            ]
                        });
                        insertStudent(data[0]);
                        $scope.post = {};
                        getList();
                        getListClass();
                    }, function (err) {
                        console.log(err.message);
                    });
            }else
            {
                $ionicPopup.alert({
                            title: "แจ้งเตือน",
                            template: "ไม่สามาถเพิ่มรายชื่อนักศึกษาได้ เนื่องจาก รหัส "+ $scope.post.stdid +" มีอยู่แล้วค่ะ",
                            buttons: [
                            {
                              text: '<b>ตกลง</b>',
                              type: 'button-positive',
                              onTap: function() {
                              }
                            }
                            ]
                        });


            }
        };
        $scope.scrollTop = function() {
            $ionicScrollDelegate.scrollTop();
        };
        $scope.edit = function () {
            
            //check
            if($scope.put.stdid == $scope.initialstu.stdid)
            {
            var query = "update student set stdid = ?, stdnamelastnameThai = ? where stdid = ? ";
            $cordovaSQLite.execute(db, query, [
                $scope.put.stdid,
                $scope.put.stdnamelastnameThai,
                $scope.initialstu.stdid
            ]).then(function () {
                $ionicPopup.alert({
                    title: "ข้อความ",
                    template: "แก้ไขรายละเอียดนักศึกษาเรียบร้อยแล้วค่ะ",
                    scope: $scope,
                    buttons: [
                    {
                      text: '<b>ตกลง</b>',
                      type: 'button-positive',
                      onTap: function() {
                      changestd = true;
                      $scope.closeEditbtt();
                      $ionicListDelegate.closeOptionButtons();
                      }
                    }
                    ]
                });
                getList();
            }, function (err) {
                console.log(err.message);
            });

            }
            else
            {
                 var check = false;                                       
                   for (var k= 0;k<$scope.datas.length;k++ )
                                    {

                                        if($scope.put.stdid == $scope.datas[k].stdid)
                                             {

                                                    check = true;
                                             }


                                 } // end for

            //
            if (!check)
            {
            var query = "update student set stdid = ?, stdnamelastnameThai = ? where stdid = ? ";
            $cordovaSQLite.execute(db, query, [
                $scope.put.stdid,
                $scope.put.stdnamelastnameThai,
                $scope.initialstu.stdid
            ]).then(function () {
                $ionicPopup.alert({
                    title: "ข้อความ",
                    template: "แก้ไขรายละเอียดนักศึกษาเรียบร้อยแล้วค่ะ",
                    scope: $scope,
                    buttons: [
                    {
                      text: '<b>ตกลง</b>',
                      type: 'button-positive',
                      onTap: function() {
                      changestd = true;
                      $scope.closeEditbtt();
                      }
                    }
                    ]
                });
                getList();
            }, function (err) {
                console.log(err.message);
            });


            } else
                    {
                         $ionicPopup.alert({
                            title: "แจ้งเตือน",
                            template: "ไม่สามาถแก้ไขรายชื่อนักศึกษาได้ เนื่องจาก รหัส "+ $scope.put.stdid +" มีอยู่แล้วค่ะ",
                            buttons: [
                            {
                              text: '<b>ตกลง</b>',
                              type: 'button-positive',
                              onTap: function() {
                              }
                            }
                            ]
                        });


                    }


            }



            
        }; 
        


 $scope.editclasstimevalue = function () {
            
if($scope.put.datestime == $scope.initialclass.datestime)
            {
           
var query = "update class set datestime = ?, note = ? where id = ? ";
            $cordovaSQLite.execute(db, query, [
                $scope.put.datestime,
                $scope.put.note,
                $scope.put.id
            ]).then(function () {
                $ionicPopup.alert({
                    title: "ข้อความ",
                    template: "แก้ไขคาบเรียนเรียบร้อยแล้วค่ะ",
                    scope: $scope,
                    buttons: [
                    {
                      text: '<b>ตกลง</b>',
                      type: 'button-positive',
                    onTap: function() {
                      changeclass = true;
                     getListClass();
                     $scope.closeeditclasstimebtt();
                      }
                    }
                    ]
                });
        
            }, function (err) {
                console.log(err.message);
            });
            
            }
            else
            {
                 var check = false;                                       
                   for (var k= 0;k<$scope.dataClass.length;k++ )
                                    {

                                        if($scope.put.datestime == $scope.dataClass[k].datestime)
                                             {

                                                    check = true;
                                             }

                                 } // end for

            //
            if (!check)
            {
                var query = "update class set datestime = ?, note = ? where id = ? ";
                $cordovaSQLite.execute(db, query, [
                $scope.put.datestime,
                $scope.put.note,
                $scope.put.id
            ]).then(function () {
                $ionicPopup.alert({
                    title: "ข้อความ",
                    template: "แก้ไขคาบเรียนเรียบร้อยแล้วค่ะ",
                    scope: $scope,
                    buttons: [
                    {
                      text: '<b>ตกลง</b>',
                      type: 'button-positive',
                      onTap: function() {
                      changeclass = true;
                     getListClass();
                     $scope.closeeditclasstimebtt();
                      }
                    }
                    ]
                });
        
            }, function (err) {
                console.log(err.message);
            });
            


            } else
                    {
                         $ionicPopup.alert({
                            title: "แจ้งเตือน",
                            template: "ไม่สามาถแก้ไขคาบเรียนได้เนื่องจากไปตรงกับคาบเรียนอื่น",
                            buttons: [
                            {
                              text: '<b>ตกลง</b>',
                              type: 'button-positive',
                              onTap: function() {
                              }
                            }
                            ]
                        });


                    }


            }
   
        };      
    $scope.addnewoccurrence = function () { 
             $scope.checkexist = false;
             $scope.postcheck = {};
             var dataocc = [];
             $scope.postcheck.cid = $scope.cid;
             $scope.postcheck.statusname = $scope.post.statusname;
             
             if ($scope.post.color === undefined)
             {
                $scope.postcheck.color = '#f00000';

             }
             else
             {
                $scope.postcheck.color = $scope.post.color;
             } 
             if ($scope.post.calpresent === undefined)
             {
                $scope.postcheck.calpresent = 0;

             } else
             {
                 $scope.postcheck.calpresent = $scope.post.calpresent;
             }
            

            angular.forEach($scope.postcheck, function (element) {
                dataocc.push(element);
                
            });
       
        // Check Exist
             for (var i = 0; i < $scope.dataoccurr.length; i++) {
                    
                    if($scope.dataoccurr[i].statusname ==  $scope.post.statusname.trim())
                    {
                     
                     $scope.checkexist = true;
                    
                    }
                   
                }

            if ($scope.checkexist)
            {
                    $ionicPopup.alert({
                                title: "แจ้งเตือน",
                                template: "มีข้อมูลสถานะการเรียนอยู่แล้ว",
                                buttons: [
                                {
                                  text: '<b>ตกลง</b>',
                                  type: 'button-positive',
                                  onTap: function() {
                                 
                                  }
                                }
                                ]
                            
                            });
            }else
            {
                    var query = "INSERT INTO status (csta_index,statusname,color,calpresent) VALUES (?,?,?,?)";
                        $cordovaSQLite.execute(db, query,dataocc).then(function () {
                            $ionicPopup.alert({
                                title: "ข้อความ",
                                template: "เพิ่มข้อมูลสถานะเรียบร้อย",
                                buttons: [
                                {
                                  text: '<b>ตกลง</b>',
                                  type: 'button-positive',
                                  onTap: function() {
                                  getoccurence();
                                  $scope.post = {};
                                  $scope.postcheck = {};
                                  $scope.closeaddcurrence();
                                  }
                                }
                                ]
                            
                            });
                            
                        }, function (err) {
                            console.log(err.message);
                        });
            }

        };
         $scope.editsaveoccurr = function () {
         
            if($scope.put.statusname == $scope.initialoccurr.statusname)
            {
                var updatoccurr = "update status " + " set statusname = ?, color = ?, calpresent = ? where id = ? ";
                $cordovaSQLite.execute(db, updatoccurr, [$scope.put.statusname,$scope.put.color,$scope.put.calpresent,$scope.put.id]).then(function(res) {    
                $ionicPopup.alert({
                    title: "ข้อความ",
                    template: "แก้ไขลสถานะการเข้าเรียนเรียบร้อยแล้วค่ะ",
                    scope: $scope,
                    buttons: [
                    {
                      text: '<b>ตกลง</b>',
                      type: 'button-positive',
                      onTap: function() {
                         prepareStatus();
                         getoccurence();
                         $scope.closeEditoccurrbuttonadd();
                      }
                    }
                    ]
                });
              
            }, function (err) {
                console.log(err.message);
            });

            }
            else
            {
                 var check = false;                                       
                   for (var k= 0;k<$scope.dataoccurr.length;k++ )
                                    {

                                        if($scope.put.statusname == $scope.dataoccurr[k].statusname)
                                             {

                                                    check = true;
                                             }


                                 } // end for

            //
            if (!check)
            {
                var updatoccurr = "update status " + " set statusname = ?, color = ?, calpresent = ? where id = ? ";
                $cordovaSQLite.execute(db, updatoccurr, [$scope.put.statusname,$scope.put.color,$scope.put.calpresent,$scope.put.id]).then(function(res) {    
                $ionicPopup.alert({
                    title: "ข้อความ",
                    template: "แก้ไขสถานะการเข้าเรียนเรียบร้อยแล้วค่ะ",
                    scope: $scope,
                    buttons: [
                    {
                      text: '<b>ตกลง</b>',
                      type: 'button-positive',
                      onTap: function() {
                         prepareStatus();
                         getoccurence();
                         $scope.closeEditoccurrbuttonadd();
                      }
                    }
                    ]
                });
              
            }, function (err) {
                console.log(err.message);
            });


            } else
                    {
                         $ionicPopup.alert({
                                title: "แจ้งเตือน",
                                template: "มีข้อมูลสถานะการเข้าเรียนอยู่แล้ว",
                                buttons: [
                                {
                                  text: '<b>ตกลง</b>',
                                  type: 'button-positive',
                                  onTap: function() {
                                 
                                  }
                                }
                                ]
                            
                            });


                    }


            }
        };

        function getList() {
            //console.log("getList");
            $scope.dataLoaded = false;
            $scope.showstudentintro = true;
            $cordovaSQLite.execute(db, 'SELECT * FROM student where cstu_index =? order by cast(stdid as unsigned) asc, stdnamelastnameThai asc',[$scope.cid]).then(function (res) {
                 $scope.datas = [];
                if (res.rows.length > 0)
                {
                 $scope.showstudentintro = true;
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.datas.push(res.rows.item(i));
                }
                 
                 $scope.hide($ionicLoading);
                
                }
                else
                {
                    $scope.showstudentintro = true;
                    $scope.showstudentintro = false;
                    $scope.hide($ionicLoading);
                    $scope.scrollTop();
                    //$scope.$apply();
                }
                $scope.dataLoaded = true;
            }, function (err) {
                console.log(err.message);
                $scope.hide($ionicLoading);
            });
            
        };

 function prepareStatus () {
             $scope.dataStatusprepare = [];
             $cordovaSQLite.execute(db, 'SELECT * FROM status where csta_index = ?',[$scope.cid]).then(function (res) {
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.dataStatusprepare.push(res.rows.item(i));  
                }

                }, function (err) {
                    console.log(err.message);
            });
       };
        
        
    

     
      $scope.selectcolor  = function (selcolor)  {

                $scope.selectoccColor = selcolor;
            };
        $scope.selectEditcolor  = function (selcolor)  {

                $scope.selectoccEditColor = selcolor;

                
            };

     $scope.updatecolor  = function (index,id,color)  {

                if(color != "")
                {
                     var querycolor = "update status " + " set color = ? where id = ? ";
                            $cordovaSQLite.execute(db, querycolor, [color,id]).then(function(res) {
                            
                            $scope.dataoccurr[index].color = color;
                            prepareStatus();
                            //getList();
                           getoccurence();


                    }, function (err) {
                        alert('มีข้อผิดพลาด' + err.message);
                    });
                }
            };
             
            $scope.update_setcalpresent  = function (idv,vaaa,index)  {
                //console.log(idv+ " " + vaaa+ " "+ index);

                var querycal = "update status " + " set calpresent = 0 where id = ? ";
              
                
                if(vaaa ===1)
                {
                     var querycal = "update status " + " set calpresent = 1 where id = ? ";
                     $scope.dataoccurr[index].calpresent = 1;
                }else
                {

                    $scope.dataoccurr[index].calpresent = 0;
                }
                
                            
                            $cordovaSQLite.execute(db, querycal, [idv]).then(function(res) {
                            
                            prepareStatus();
                            //getList();
                            getoccurence();


                    }, function (err) {
                        alert('มีข้อผิดพลาด' + err.message);
                    });
                
            };

    $scope.removeItem = function (index,idrec) {
                 
        $ionicPopup.show({
                title: 'ยืนยันการลบ',
                template: "คุณแน่ใจที่จะลบสถานะการเข้าเรียน",
                buttons: [
                    {
                        text: 'ตกลง',
                        type: 'button-positive',
                        onTap: function () {
                            
                           //check status first
                            var q1 = "SELECT * FROM course_" + $scope.cid + " where  statusindex = ?";
                            var q2 = "DELETE FROM status where id = ?";
                            // select use or not
                            $cordovaSQLite.execute(db, q1, [idrec]).then(function(res) {
                                        if(res.rows.length >0 )
                                        {
                                                $ionicPopup.alert({
                                                    title: "ข้อความ",
                                                    template: "ไม่สารถลบข้อมูลได้เพราะมีการใช้งาน",
                                                    buttons: [
                                                    {
                                                      text: '<b>ตกลง</b>',
                                                      type: 'button-positive',
                                                      onTap: function() {
                                                   
                                                      }
                                                    }
                                                    ]
                                                });
                                        }else
                                        {

                                                $cordovaSQLite.execute(db, q2, [idrec]).then(function(res) {
                                                
                                                $scope.dataoccurr.splice(index, 1);

                                                }, function (err) {
                                                    alert('มีข้อผิดพลาด' + err.message);
                                                });
                                       
                                        }

                            }, function (err) {
                                

                                alert('มีข้อผิดพลาด' + err.message);
                            

                            });

                          
                        }
                    },
                    {
                        text: 'ยกเลิก',
                        type: 'button-assertive',
                        onTap: function () {
                            
                        }
                    }
                ]
            });



         };

    function getoccurence() {
            
          $scope.dataoccurrLoaded = false;
          $scope.showoccurrintro = true;
          $scope.dataoccurr = [];
          $scope.statuspresent= 0 ;

          $cordovaSQLite.execute(db, 'SELECT * FROM status where csta_index = ?',[$scope.cid]).then(function (res) {
                
                if(res.rows.length == 0)
                {
                   $scope.showoccurrintro = false;
                }
                for (var i = 0; i < res.rows.length; i++) {
                    
                    if(res.rows.item(i).statusname == "มา")
                    {
                     
                     
                     $scope.statuspresent = res.rows.item(i).id; 


                    }
                    $scope.dataoccurr.push(res.rows.item(i));
                }
                
                //console.log($scope.dataoccurr);
        
            }, function (err) {
                console.log(err.message);
            
            });
            //$scope.$apply();
            $scope.dataoccurrLoaded = true;
        };
    
        $ionicModal.fromTemplateUrl('templates/addstudent.html', {
            scope: $scope,
            hardwareBackButtonClose: false
        }).then(function (modal) {
            $scope.modalAdd = modal;
        });
        $scope.$on('$destroy', function() {
             $scope.modalAdd.remove();
        });
         $ionicModal.fromTemplateUrl('templates/addclasstime.html', {
            scope: $scope,
            hardwareBackButtonClose: false
        }).then(function (modal) {
            $scope.modalAddclasstime = modal;
        });
         $scope.$on('$destroy', function() {
             $scope.modalAddclasstime.remove();
        });
        $ionicModal.fromTemplateUrl('templates/editstudent.html', {
            scope: $scope,
            hardwareBackButtonClose: false
        }).then(function (modal) {
            $scope.modalEdit = modal;
        });
         $scope.$on('$destroy', function() {
             $scope.modalEdit.remove();
        });
        $ionicModal.fromTemplateUrl('templates/importcsv.html', {
            scope: $scope,
            hardwareBackButtonClose: false
        }).then(function (modal) {
            $scope.modalImport = modal;
        });
        $scope.$on('$destroy', function() {
        //$scope.modalImport.remove();
        $scope.modaladdoccurrence.remove(); 
        $scope.modalEditOccurr.remove();
        $scope.modaleditclasstime.remove();
        //$scope.modalshowgraphresult.remove();
        $scope.modalEdit.remove();
        $scope.modalAdd.remove();
        });
        
        $ionicPopover.fromTemplateUrl('templates/popoverinstruction.html', {
            scope: $scope,

        }).then(function (popover) {
            $scope.popInstuctionCheck = popover;
        });
        $ionicPopover.fromTemplateUrl('templates/popoverclass.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popClass = popover;
        });
        $ionicPopover.fromTemplateUrl('templates/popoverstudent.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popStudent = popover;
        });
        
         $ionicModal.fromTemplateUrl('templates/addoccurrence.html', {
            scope: $scope,
            hardwareBackButtonClose: false
        }).then(function (modal) {
            $scope.modaladdoccurrence = modal;
        });
        $ionicModal.fromTemplateUrl('templates/editOccurr.html', {
            scope: $scope,
            hardwareBackButtonClose: false
        }).then(function (modal) {
            $scope.modalEditOccurr= modal;
        });
         $ionicModal.fromTemplateUrl('templates/editclasstime.html', {
            scope: $scope,
            hardwareBackButtonClose: false
        }).then(function (modal) {
            $scope.modaleditclasstime = modal;
        });
        $ionicModal.fromTemplateUrl('templates/showgraphbyperiod.html', {
            scope: $scope,
            hardwareBackButtonClose: false
        }).then(function (modal) {
            $scope.modalshowgraphresult= modal;
        });
        $scope.closeEdit = function () {
            $scope.put = angular.copy($scope.initialstu);
            $scope.modalEdit.hide();
        };
         $scope.closeEditbtt = function () {
            $scope.modalEdit.hide();
        };
        $scope.closeAdd = function () {
            $scope.post = {};
            $scope.modalAdd.hide();
        };
        $scope.closeAddclasstime = function () {
            $scope.post = {};
            $scope.modalAddclasstime.hide();
        };
        $scope.closegraphresult = function () {
            $scope.modalshowgraphresult.remove();
        };
         $scope.closeImport = function () {
             document.getElementById("orderForm").reset();
             document.getElementById('Btnupfile').disabled = true;
            file = '';
            $scope.isDisabled = true;
            $scope.modalImport.remove();
        };
        
         $scope.closeaddcurrence = function () {
           $scope.selectoccColor ="#0000ff";
            $scope.post={};
            $scope.modaladdoccurrence.hide();
        };
        $scope.closeEditoccurr = function () {
            $scope.put = angular.copy($scope.initialoccurr);
            $scope.modalEditOccurr.hide();
        };
         $scope.closeEditoccurrbuttonadd = function () {
            $scope.modalEditOccurr.hide();
        };
        
        $scope.$on('popover.hidden', function() {


        });
        $scope.$on('popover.removed', function() {

        });
         

        $scope.closeClass = function () {
            $scope.popClass.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.popClass.remove();
        });

        $scope.closeStudent = function () {
            $scope.popStudent.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.popStudent.remove();
        });

        $scope.goAdd = function () {
            $scope.modalAdd.show();
        };
        $scope.goAddclasstime = function () {
            $scope.post.noticeText ='';
            $scope.modalAddclasstime.show();
        };
        $scope.goAddOccurrence = function () {
            $scope.modaladdoccurrence.show();
        };
        $scope.addnewocurrence = function () {
           
        };
        
       $scope.getreportbyperiod = function(){
            $scope.show($ionicLoading);
            $scope.link = "#/reportbyperiod/" + $scope.cid;
            window.location.href= $scope.link;
            //$ionicHistory.clearCache().then(function(){ window.location.href= $scope.link; });
            
        };
        $scope.getreportbyperson = function(){
            
            $scope.link = "#/reportbyperson/" + $scope.cid;
            //$ionicHistory.clearCache().then(function(){ window.location.href= $scope.link; });
            window.location.href= $scope.link;

             
        };
        
        $scope.showFilterBar = function () {
            changestd = false;
            $scope.closeStudent();
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.datas,
                update: function (filteredItems) {
                    $scope.datas = filteredItems;
                },
                cancel : function () {
                    if(changestd)
                    {
                     getList();
                    } 
                }
            });
        };
       
        $scope.showFilterBarClass = function () {
            $scope.closeClass();
            changeclass = false;
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.dataClass,
                update: function (filteredItems) {
                    $scope.dataClass = filteredItems;
                    if(changeclass)
                    {
                      getListClass();
                    }
                },
                cancel : function () {
                    if(changeclass)
                    {
                      getListClass();
                    }
                }
            });
        };
        
         $scope.showFilterBarresultclass = function () {
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.dataClass,
                update: function (filteredItems) {
                    $scope.dataClass = filteredItems;
                }
            });
        };
        
        $scope.refreshItems = function () {
            if (filterBarInstance) {
                filterBarInstance();
                filterBarInstance = null;
            }
            $timeout(function () {
                getList();
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $scope.refreshItemsClass = function () {
            if (filterBarInstance) {
                filterBarInstance();
                filterBarInstance = null;
            }
            $timeout(function () {
                getListClass();
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        
        $scope.goBack = function() {
            //DF = window.plugins.deviceFeedback;
            //DF.haptic(DF.VIRTUAL_KEY);
            navigator.vibrate(40);
            $state.go('home');
        };
        $scope.gotabStudent = function() {
            //DF = window.plugins.deviceFeedback;
            //DF.haptic(DF.VIRTUAL_KEY);
            navigator.vibrate(40);
            $state.go('course.students');
        };
     
        $scope.gotoreport = function() {
        //DF = window.plugins.deviceFeedback;
        //DF.haptic(DF.VIRTUAL_KEY);
        navigator.vibrate(40);
        $scope.closeClass();
        $scope.linkreport = "#/selectreport/" + $scope.cid; 
        window.location.href= $scope.linkreport;
        //$ionicHistory.clearCache().then(function(){ window.location.href= $scope.linkreport; });
        };
        $scope.gotoreportpop = function() {
        $scope.closeClass();
        $scope.linkreport = "#/selectreport/" + $scope.cid; 
        window.location.href= $scope.linkreport;
        //$ionicHistory.clearCache().then(function(){ window.location.href= $scope.linkreport; });
        };

        $scope.click = function(data){

            classdate = data.id;
            $scope.link = "#/eachclass/" + $scope.cid + "/" + data.id + "/" + data.datestime; 
            //window.location.href= $scope.link;
            $ionicHistory.clearCache().then(function(){ window.location.href= $scope.link; });
        };

        $scope.editStudent = function(data){
         
          $scope.initialstu =  data;
          $scope.put = angular.copy($scope.initialstu);
          $scope.modalEdit.show();
        };


        $scope.editOccurr = function(data){
          $scope.initialoccurr =  data;
          $scope.put = angular.copy($scope.initialoccurr);
          $scope.modalEditOccurr.show();
        };
        $scope.onchangdate= function(da){
          $scope.put.datestime = da;
          ;
        };

        $scope.editClass = function(data){
          $scope.initialclass =  data;
          $scope.put = angular.copy($scope.initialclass);
          $scope.modaleditclasstime.show();
        };
        

        $scope.closeeditclasstime = function () {
           
            $scope.put = angular.copy($scope.initialclass);
            $scope.modaleditclasstime.hide();
        };
         $scope.closeeditclasstimebtt = function () {
            $scope.modaleditclasstime.hide();
        };

        $scope.deleteStudent = function(index,data){
            //alert(index);
        
          $ionicPopup.show({
                title: 'ยืนยันการลบ',
                template: "คุณแน่ใจที่จะลบนักศึกษาใช่หรือไม่",
                buttons: [
                    {
                        text: 'ตกลง',
                        type: 'button-positive',
                        onTap: function () {
                            
                            var q1 = "DELETE FROM course_"+ $scope.cid + " where stdindex_rec = ?";
                            $cordovaSQLite.execute(db, q1, [data]);
                            var q2 = "delete from student where id = ? and cstu_index = ?";
                            $cordovaSQLite.execute(db, q2, [data,$scope.cid]);
                            $scope.datas.splice(index, 1);
                            $ionicListDelegate.closeOptionButtons();
                            changestd = true;
                            //getList();

                        }
                    },
                    {
                        text: 'ยกเลิก',
                        type: 'button-assertive',
                        onTap: function () {
                            
                        }
                    }
                ]
            });
        };
        $scope.importStudent = function(){
        var modalOptions = {scope:$scope, animation: 'slide-in-up'};
         $ionicModal.fromTemplateUrl('templates/importcsv.html', modalOptions).then(function(dialog) {
        $scope.modalImport = dialog;
        $scope.modalImport.show();
    });
};
            
$scope.ExportData = function() {
    $scope.dataExportfinal = [];
    $scope.dataExportfinalforreport = [];
    var nameThaiexport = "";
    var stdNumexport = "";
    var idexport = [];  
    var idexportfinal = [];  
    
    var q3 = "SELECT *, COUNT(*) as c FROM (SELECT * FROM course_" + $scope.cid + " INNER JOIN  student ON (course_" + $scope.cid  +".stdindex_rec = student.id)" + "INNER JOIN status ON (status.id =  course_" + $scope.cid + ".statusindex)" + " where course_" + $scope.cid + ".course_index = ? ) group by stdid, statusindex ";
    $cordovaSQLite.execute(db, q3,[$scope.cid]).then(function (res) {
                    
                    if (res.rows.length > 0) {

                    for (var j= 0; j< $scope.datas.length;j++ ){
                        for(var i=0; i<res.rows.length; i++)
                          {
                             if ($scope.datas[j].stdid == res.rows.item(i).stdid)
                                {
                                    stdNumexport = res.rows.item(i).stdid;
                                    nameThaiexport = res.rows.item(i).stdnamelastnameThai;
                                    
                                    idexport.push({ 
                                        value: res.rows.item(i).statusname,
                                        count: res.rows.item(i).c,
                                        color: res.rows.item(i).color });
                                }

                            
                           } 
                            
                    for (var m= 0; m<$scope.dataoccurr.length;m++ )
                        {
                                     match =false;
                                     for (var p = 0; p < idexport.length;p++)
                                     {
                                            
                                           
                                                if ($scope.dataoccurr[m].statusname ==  idexport[p].value)

                                                {
                                                    
                                                    match = true;
                                                    if($scope.dataoccurr[m].statusname == 'ไม่ระบุ')
                                                    {
                                                          idexportfinal.push({ 
                                                            value: "ไม่ระบุ",
                                                            count: idexport[p].count,
                                                            color: idexport[p].color});
                                                    

                                                     } else {   
                                                        idexportfinal.push({ 
                                                            value: idexport[p].value,
                                                            count: idexport[p].count,
                                                            color: idexport[p].color});
                                                    }
                                                }
                                                    
                                    }

                                    
                                            
                                             if(!match)
                                             {
                                                 if($scope.dataoccurr[m].statusname == 'ไม่ระบุ')
                                                 {
                                                     idexportfinal.push({ 
                                                        value: "ไม่ระบุ",
                                                        count: "",
                                                        color: $scope.dataoccurr[m].color});


                                                 } else
                                                 {
                                                     idexportfinal.push({ 
                                                        value: $scope.dataoccurr[m].statusname,
                                                        count: "",
                                                        color: $scope.dataoccurr[m].color});


                                                 }

                                                
                                            }


                        }



                            $scope.dataExportfinal .push({
                            stdID:  stdNumexport,
                            name: nameThaiexport,
                            id: idexportfinal
                             });
                        
                                    // reset
                                    nameThaiExport = "";
                                    surname = "";
                                    stdNumexport = "";
                                    idexport = [];
                                    idexportfinal = [];

                        }

                            if($scope.dataExportfinal.length > 0 )
                             {
                                
                                 var q1 = "SELECT * FROM course where id = ?";
                                 $cordovaSQLite.execute(db, q1 ,[$scope.cid]).then(function (res) {

                                    $scope.courseid = res.rows.item(0).courseid;
                                    $scope.aliastitle = res.rows.item(0).alias;
                                    $scope.section = res.rows.item(0).section;

                                   
                                                        
                                var date = new Date();
                                $scope.FromDate = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() ;
                                $scope.HHmmss = $filter('date')(new Date(), 'HH-mm-ss');
                                var titlefilename = $scope.courseid+"_"+$scope.aliastitle+"_"+$scope.section+"_"+$scope.FromDate;
                                var filename = titlefilename + ".csv";
                                //var filePath = "file:///storage/emulated/0/Download";
                                var filePath = "";
                                if (ionic.Platform.isIOS())
                                {
                                     filePath = cordova.file.documentsDirectory;
                                }
                                if (ionic.Platform.isAndroid()) 
                                {
                                     filePath  = "file:///storage/emulated/0/Download";
                                }
                                

                                        $cordovaFile.createFile(filePath, filename, true).then(function() {
                                            return $cordovaFile.writeFile(filePath, filename, JSONToCSVConvertor($scope.dataExportfinal,true), true);
                                        }).then( function(result) {
                                                                            
                                            $ionicPopup.alert({
                                                    title: "ข้อความ",
                                                    template: "ส่งออกไฟล์เรียบร้อยแล้วค่ะ "+"<p>ไฟล์อยู่ที่ /sdcard/Download/" + filename,
                                                    buttons: [
                                                            {
                                                              text: '<b>ตกลง</b>',
                                                              type: 'button-positive',
                                                              onTap: function() 
                                                                    {
                                                                        $scope.closeStudent();
                                                                    }
                                                            }
                                                            ]
                                                    });


                                        }, function(err) {
                                            alert(JSON.stringify(err));
                                        });



                                         }, function (err) {
                                        console.log(err.message);
                                    });

                             }

                    }else
                    {

                                 $ionicPopup.alert({
                                                    title: "ข้อความ",
                                                    template: "ไม่สามารถส่งออกข้อมูลได้ เนื่องจากยังไม่มีข้อมูลการเข้าเรียน",
                                                    buttons: [
                                                            {
                                                              text: '<b> ตกลง</b>',
                                                              type: 'button-positive',
                                                              onTap: function() 
                                                                    {
                                                                        
                                                                    }
                                                            }
                                                            ]
                                                    });
                    }
                
                    //$scope.hide($ionicLoading);
                },
                function(error) {
                    $scope.statusMessage = "Error on loading: " + error.message;
                    //$scope.hide($ionicLoading);
                }
            );

    };

     function JSONToCSVConvertor(JSONData, ShowLabel) {
     
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

        var CSV = ''; 
        var CSVresult = '';   
        if (ShowLabel) {
            var row = "";

            //This loop will extract the label from 1st index of on array
            for (var index in arrData[0]) {

                //Now convert each value to string and comma-seprated
                if(typeof arrData[0][index]=='object')
                {
                    for (var k = 0; k < arrData[0][index].length; k++) 
                    {
                       row += '"' + arrData[0][index][k].value + '",';
                    
                    }
               

                }else
                {
                  if(index=="stdID")
                  {

                    row += "รหัส" + ',';
                  }
                  if(index=="name")
                  {

                    row += "ชื่อ-นามสกุล" + ',';
                  }
                  
                }
            }

            row = row.slice(0, -1);

            CSV += row + '\r\n';
        }

        //1st loop is to extract each row
        for (var i = 0; i < arrData.length; i++) {
            var row = "";

            //2nd loop will extract each column and convert it in string comma-seprated
            for (var index in arrData[i]) {
            
                if(typeof arrData[i][index]=='object')
                {
               
                    for (var k = 0; k < arrData[i][index].length; k++) 
                    {
                       
                       row += '"' + arrData[i][index][k].count + '",';
                    
                    }
                }else
                {
                        row += '"' + arrData[i][index] + '",';

                }
                
            }

            row.slice(0, row.length - 1);

            //add a line break after each row
            CSV += row + '\r\n';
        }
         
        if (CSV == '') {        
            alert("Error");
            return;
        }   
        var csv = "\ufeff"+CSV;
        //var blob = new Blob([csv], { type: ' type: "text/csv;charset=UTF-8"' });
        var blob = new Blob([csv], {type: 'text/csv;charset=windows-1252;'});//Here, I also tried charset=GBK , and it does not work either
        
        return blob;
    };
       
        // end Export
        $scope.deleteAllStudent = function(){
            $scope.closeStudent();
            if($scope.datas.length === 0){
                $ionicPopup.show({
                    title: 'ข้อความ',
                    template: "ขณะนี้ไม่มีรายชื่อนักศึกษาให้ลบ",
                    buttons: [
                        {
                            text: 'ตกลง',
                            type: 'button-positive',
                            onTap: function () {
                            }
                        }
                    ]
                });
            }// end if
            else{
                $ionicPopup.show({
                    title: 'ยืนยันการลบ',
                    template: "คุณแน่ใจที่จะลบรายชื่อนักศึกษาทั้งหมดนี้ใช่หรือไม่",
                    buttons: [
                        {
                            text: 'ตกลง',
                            type: 'button-positive',
                            onTap: function () {
                                var q1 = "DELETE FROM course_"+ $scope.cid;
                                var q2 = "DELETE FROM student where cstu_index = ?";
                                $cordovaSQLite.execute(db, q1);
                                $cordovaSQLite.execute(db, q2,[$scope.cid]);
                                $ionicHistory.clearCache();
                               getList();
                            }
                        },
                        {
                            text: 'ยกเลิก',
                            type: 'button-assertive',
                            onTap: function () {
                                //$scope.modalEdit.show();
                            }
                        }
                    ]
                });
            } // end else
        
    };
    $scope.someFuncHub = function(){
        alert("Test");
    };
    $scope.someFunc = function(){
     navigator.vibrate(40);
    };
 //importCsv
     $scope.saveFile= function(files) {
         file = files[0];
      
         if(file === undefined)
            {
                document.getElementById("uploadFile").value = '';
                //$scope.isDisabled = true;
                document.getElementById('Btnupfile').disabled = true;

            }
            else
            {
                 //alert(file.name);
                 document.getElementById("uploadFile").value = file.name;
                 document.getElementById('Btnupfile').disabled = false;

            }
         
     };
   
     $scope.uploadFile = function() {
        var liststudent = "";
        var all =0 ;
        var count = 0;
        var countunimport = 0;
        var checkconsis = false;
        $scope.count = 0;
        if(file === undefined || file === '')
        {
                                             $ionicPopup.alert({
                                                            title: "ข้อความ",
                                                            template: "โปรดเลือกไฟล์",
                                                            buttons: [
                                                                        {
                                                                          text: '<b>ตกลง</b>',
                                                                          type: 'button-positive',
                                                                          onTap: function() {

                                                                          
                                                                          }
                                                                        }
                                                                     ]
                                                            });
                                        

                                        return;


        } else
         {
         if(!file.type.match('text/comma-separated-values')) {
                
                                $ionicPopup.alert({
                                    title: "ข้อความ",
                                    template: "เฉพาะไฟล์ CSV เท่านั้น",
                                    buttons: [
                                                {
                                                  text: '<b>ตกลง</b>',
                                                  type: 'button-positive',
                                                  onTap: function() {

                                                  
                                                  }
                                                }
                                             ]
                                    });
                

                return;
            }
          Papa.parse(file, 
            {

                    error: function(err, file, inputElem, reason)
                        {
                             
                            alert(file+err+reason);
                        },
                        complete: function(results) 
                        {
                            all = 0;
                            count = 0;
                            countunimport = 0;
                            for (var j=1;j<results.data.length;j++)
                            {
                                if(results.data[j].length > 1)
                                    {
                                        all = all + 1;
                                        var check = false;                                       
                                        for (var k= 0;k<$scope.datas.length;k++ )
                                        {
                                                if(results.data[j][0]==$scope.datas[k].stdid)
                                                {
                                                    if(countunimport == 0)
                                                    {
                                                         liststudent = results.data[j][0];
                                                    }
                                                    else
                                                    {
                                                        liststudent = liststudent + ", " + results.data[j][0] ;

                                                    }
                                                    
                                                    
                                                    
                                                    check = true;
                                                    checkconsis = true;
                                                    countunimport = countunimport + 1; 
                                                }



                                        } // end for
                                        if(!check)
                                        {

                                        $cordovaSQLite.execute(db, 'INSERT INTO student (stdid,stdnamelastnameThai,cstu_index) VALUES (?,?,?)', [results.data[j][0],results.data[j][1],$scope.cid])
                                        .then(function(result) {
                                            
                                                          insertStudentfromImport(result.insertId);

                                        }, function(error) {
                                                             console.log("Error on saving: " + error.message);
                                                          });
                                        count = count + 1;
                                        }

                                        
                                    }
                            }
                                if(checkconsis)
                                {
                                    $ionicPopup.alert({
                                    title: "แจ้งเตือน",
                                    template: "นักศึกษาทั้งหมด " + all + " คน <p>สามารถนำเข้าข้อมูลนักศึกษาได้ " + count + " คน ไม่ได้ " + countunimport + " คน </p>เนื่องจากรหัสซ้ำซ้อน ได้แก่ </p>" + liststudent ,
                                    buttons: [
                                                {
                                                  text: '<b>ตกลง</b>',
                                                  type: 'button-positive',
                                                  onTap: function() {
                                                   document.getElementById("orderForm").reset();
                                                  document.getElementById("uploadBtn").value = "";
                                                  document.getElementById("uploadFile").value = "";
                                                  file="";
                                                  liststudent ="";
                                                  all = 0;
                                                  count = 0;
                                                  countunimport = 0;
                                                  $scope.isDisabled = true;
                                                  getList();
                                                  $scope.closeImport();
                                                  $scope.closeStudent();
                                                  }
                                                }
                                             ]
                                    });


                                }else
                                {
                                
                                $ionicPopup.alert({
                                    title: "ข้อความ",
                                    template: "นำเข้าข้อมูลนักศึกษาจำนวน " + count + " คน <p> เรียบร้อยแล้วค่ะ",
                                    buttons: [
                                                {
                                                  text: '<b>ตกลง</b>',
                                                  type: 'button-positive',
                                                  onTap: function() {
                                                document.getElementById("orderForm").reset();
                                                document.getElementById("uploadBtn").value = "";
                                                document.getElementById("uploadFile").value = "";
                                                document.getElementById('Btnupfile').disabled = true;
                                                file="";
                                                  liststudent ="";
                                                  all = 0;
                                                  count = 0;
                                                  countunimport = 0;
                                                  $scope.isDisabled = true;
                                                  getList();
                                                  $scope.closeImport();
                                                  $scope.closeStudent();
                                                  }
                                                }
                                             ]
                                    });

                            }
                                
                         }
        });
      }
    };

  $ionicPlatform.ready(function(){
    $scope.dateValue = '';
    $scope.minDate =  moment().locale('th').subtract(90, 'years').toDate();
    $scope.showDatePicker = function(){
       var options = {
          date: new Date(),
          mode: 'datetime', // or 'time' // 'datetime'
          is24Hour: true,
          locale:'th',
          allowOldDates: true,
          allowFutureDates: false,
          doneButtonLabel: 'DONE',
          doneButtonColor: '#F2F3F4',
          cancelButtonLabel: 'CANCEL',
          cancelButtonColor: '#000000'
       };


        document.addEventListener("deviceready", function () {

            $cordovaDatePicker.show(options).then(function(date){
               moment.locale('th');
               $scope.post.dateclassvalue = date;

            });
            

        }, false);
        

    };
  
    $scope.editDatePicker = function(){
       var options = {
          date: new Date($scope.put.datestime),
          mode: 'datetime', 
          is24Hour: true,
          allowOldDates: true,
          allowFutureDates: false,
          doneButtonLabel: 'DONE',
          doneButtonColor: '#F2F3F4',
          cancelButtonLabel: 'CANCEL',
          cancelButtonColor: '#000000'
          };
          document.addEventListener("deviceready", function () {

            $cordovaDatePicker.show(options).then(function(date){
               moment.locale('th');
               $scope.put.datestime = date;
            });
            

        }, false);
        
        };
  });
 
 $scope.addclasstimevalue = function() {
       
        //check
        var check = false; 
        for (var i = 0; i < $scope.dataClass.length; i++) {
                    
                    if($scope.dataClass[i].datestime ==  $scope.post.dateclassvalue)
                    {
                     
                     check = true;
                    
                    }
                   
                }

            if (check)
            {
                    $ionicPopup.alert({
                                title: "แจ้งเตือน",
                                template: "มีข้อมูลคาบเรียนอยู่แล้ว",
                                buttons: [
                                {
                                  text: '<b>ตกลง</b>',
                                  type: 'button-positive',
                                  onTap: function() {
                                 
                                  }
                                }
                                ]
                            
                            });
            }else
            {
                var data = [];
                 $scope.post.cid = $scope.cid;
                 //alert($scope.post.dateclassvalue);
                angular.forEach($scope.post, function (element) {
                data.push(element);
                });

      var query = "INSERT INTO class (note,datestime,ccla_index) VALUES (?,?,?)";
                $cordovaSQLite.execute(db, query,data).then(function(res) {
                    $ionicPopup.alert({
                                    title: "ข้อความ",
                                    template: "เพิ่มคาบเรียนเรียบร้อยแล้วค่ะ",
                                    buttons: [
                                                {
                                                  text: '<b>ตกลง</b>',
                                                  type: 'button-positive',
                                                  onTap: function() {
                                                  
                                                  }
                                                }
                                             ]
                                    });
                    
                    insertStdtoClass(res.insertId);
                    getListClass();
                    $scope.closeAddclasstime();
    
                }, function (err) {
                    alert('ERROR ' + err.message);
                });
            }

};
  

$scope.sortClass = function(data) {
        var date = new Date(data.datestime);
        return date;
    };

    function insertStdtoClass(dtValueindex){
        //console.log("dt-->"+dtValueindex);
        var idstatus = 0;
         $cordovaSQLite.execute(db, 'SELECT * FROM status where csta_index = ? and statusname = ?',[$scope.cid,"ไม่ระบุ"]).then(function (resstatusvalue) {
                for (var i = 0; i < resstatusvalue.rows.length; i++) {
                    idstatus = resstatusvalue.rows.item(i).id;  
                }
                }, function (err) {
                    console.log(err.message);
            });

        $cordovaSQLite.execute(db, 'SELECT * FROM student where cstu_index = ?',[$scope.cid]).then(function (res) {
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.sid = res.rows.item(i)['id'];
                    //var query = "update course_" + $scope.cid + "_" + $scope.section + " set datestime = ? where stdid = ? and cid = ? and section = ?";
                    var query = "INSERT INTO course_" + $scope.cid + " (stdindex_rec, course_index, datestimeindex, statusindex) VALUES (?,?,?,?)";
                    //$cordovaSQLite.execute(db, query, [dtValue, $scope.sid, $scope.cid, $scope.section]).then(function(res) {
                    $cordovaSQLite.execute(db, query, [$scope.sid, $scope.cid,dtValueindex,idstatus]).then(function(res) {    
                    }, function (err) {
                        alert('ERROR' + err.message);
                    });
                }
        }, function (err) {
            console.log(err.message);
        });
    };

    function insertStudent(stid){
          var idstatus = 0;
         $cordovaSQLite.execute(db, 'SELECT * FROM status where csta_index = ? and statusname = ?',[$scope.cid,"ไม่ระบุ"]).then(function (resstatusvalue) {
                for (var i = 0; i < resstatusvalue.rows.length; i++) {
                    idstatus = resstatusvalue.rows.item(i).id;  
                }
                }, function (err) {
                    console.log(err.message);
            });
      
        $cordovaSQLite.execute(db, 'SELECT * FROM student where stdid = ? and cstu_index = ?',[stid,$scope.cid]).then(function (resstudent) {
                for (var i = 0; i < resstudent.rows.length; i++) {
                    $scope.sid = resstudent.rows.item(i)['id'];
                    //alert($scope.sid);
                    $cordovaSQLite.execute(db, 'SELECT * FROM class where ccla_index = ?',[$scope.cid]).then(function (resclass) {
                        $scope.dtclass = [];
                        for (var k = 0; k< resclass.rows.length; k++){
                            $scope.dtclass.push(resclass.rows.item(k));
                        } // end for

                        if (resclass.rows.length > 0){
                            for (var j = 0; j < $scope.dtclass.length; j++){
                                var q1 = "INSERT INTO course_" + $scope.cid + " (stdindex_rec,course_index,datestimeindex,statusindex) VALUES (?,?,?,?)";
                                $cordovaSQLite.execute(db, q1, [$scope.sid, $scope.cid,$scope.dtclass[j].id,idstatus]).then(function(res) {
                                    
                                }, function (err) {
                                    alert('ERROR' + err.message);
                                });
                            } // end for
                        } //end if
                        
                    }, function (err) {
                        console.log(err.message);
                    });
                    //getListAll();
                } // end for
        }, function (err) {
            console.log(err.message);
        });
        
    };

    function insertStudentfromImport(std_id){
          var idstatus = 0;
         $cordovaSQLite.execute(db, 'SELECT * FROM status where csta_index = ? and statusname = ?',[$scope.cid,"ไม่ระบุ"]).then(function (resstatusvalue) {
                for (var i = 0; i < resstatusvalue.rows.length; i++) {
                    idstatus = resstatusvalue.rows.item(i).id;  
                }
                }, function (err) {
                    console.log(err.message);
            });
      
                    $cordovaSQLite.execute(db, 'SELECT * FROM class where ccla_index = ?',[$scope.cid]).then(function (resclass) {
                        $scope.dtclass = [];
                        for (var k = 0; k< resclass.rows.length; k++){
                            $scope.dtclass.push(resclass.rows.item(k));
                        } // end for
                        if (resclass.rows.length > 0){
                            for (var j = 0; j < $scope.dtclass.length; j++){
                                var q1 = "INSERT INTO course_" + $scope.cid + " (stdindex_rec, course_index,datestimeindex,statusindex) VALUES (?,?,?,?)";
                                $cordovaSQLite.execute(db, q1, [std_id, $scope.cid,$scope.dtclass[j].id,idstatus]).then(function(res) {
                                    
                                }, function (err) {
                                    alert('ERROR' + err.message);
                                });
                            } // end for
                        } 
                    }, function (err) {
                        console.log(err.message);
                    });
                    //getListAll();
                
    };

    function getListClassId() {
        $cordovaSQLite.execute(db, 'SELECT * FROM class where id =?',[$scope.dt]).then(function (res) {
            
            if (res.rows.length > 0)
            {
               $scope.datetimeeachclass = res.rows.item(0).datestime;
            }
            
        }, function (err) {

        });
    
         $scope.dataclassattendLoaded = true;
    };
     $scope.sortClass = function(data) {
        var date = new Date(data.datestime);
        return date;
    };
    $scope.goClassAttendfromReport = function() {
         navigator.vibrate(40);   
                   $scope.link1 = "#/course/" + $scope.cid + "/classattend"; 
                   window.location.href= $scope.link1;
        };
    function getListClass() {
        //chunkconsole.log("getListClass");
        $scope.dataClass = [];
        $scope.dataclassattendLoaded = false;
        $scope.showclassattendintro = true;
        var Dtname = "";
        var realDt = "";
        var Dnote = "";
        $cordovaSQLite.execute(db, "SELECT * FROM class where ccla_index =? order by datetime(datestime) ASC ",[$scope.cid]).then(function (res) {
            
            $scope.dataClass = [];
            if (res.rows.length == 0)
            {
                $scope.showclassattendintro = false;
                $scope.dataclassattendLoaded = true;
                $scope.scrollTop();
            }
            else
            {
    
            for (var i = 0; i < res.rows.length; i++) {
                Dtname  = moment(new Date(res.rows.item(i).datestime)).format('dddd, Do MMMM YYYY HH:mm');
                realDt = res.rows.item(i).datestime;
                Dnote =  res.rows.item(i).note;
                $scope.dataClass.push({
                                        id : res.rows.item(i).id,
                                        datestime: realDt,
                                        showdateval : Dtname,
                                        ccla_index : res.rows.item(i).ccla_index,
                                        note :  Dnote

                                    });
            

            }
            }
        }, function (err) {

        });
         $scope.hide($ionicLoading); 
         $scope.dataclassattendLoaded = true;
    };
    /*function CalclassOccurr() {
         $scope.labels = [];
         $scope.datag = [];
         $scope.colors = [];
         var query  = "SELECT statusindex,count(*) as c FROM course_" + $scope.cid  + " where course_index = ? and datestimeindex = ? group by statusindex";
         $scope.sumOcc =[];
         $cordovaSQLite.execute(db, query ,[$scope.cid,$scope.dt]).then(function (resstatus) {
         for (var i = 0; i < resstatus.rows.length; i++) {
            for(var k = 0; k < $scope.dataStatusprepare.length; k++)
            {
                if (resstatus.rows.item(i).statusindex == $scope.dataStatusprepare[k].id )
                {
                     $scope.labels.push($scope.dataStatusprepare[k].statusname);
                     $scope.datag.push(resstatus.rows.item(i).c);
                     $scope.colors.push($scope.dataStatusprepare[k].color);
                     $scope.sumOcc.push({
                                            name: $scope.dataStatusprepare[k].statusname,
                                            amount: resstatus.rows.item(i).c,
                                            colorg: $scope.dataStatusprepare[k].color
                                        });

                }

            }

           
         }

         }, function (err) {
                console.log(err.message);
        
         });
         
    };*/

     $scope.showgraph = function(dttimeindex) {

        $scope.datashowgraphLoaded = false;
        $scope.showgraphintro = true;
        $scope.labelsgraph = [];
        $scope.datagraph = [];
        $scope.colorsgraph = [];
        $cordovaSQLite.execute(db, 'SELECT * FROM class where id =?',[dttimeindex]).then(function (res) {
            
            if (res.rows.length > 0)
            {
               $scope.showdate =  res.rows.item(0).datestime;
               $scope.mark = res.rows.item(0).note;
            }
            
        }, function (err) {

        });
         
         var query  = "SELECT statusindex,count(*) as c FROM course_" + $scope.cid  + " where course_index = ? and datestimeindex = ? group by statusindex";
         $scope.sumOccforgraph =[];
         $cordovaSQLite.execute(db, query ,[$scope.cid,dttimeindex]).then(function (resstatus) {

         for (var i = 0; i < resstatus.rows.length; i++) {
            for(var k = 0; k < $scope.dataStatusprepare.length; k++)
            {
                if($scope.dataStatusprepare[k].statusname !== 'ไม่ระบุ')
                {
                if (resstatus.rows.item(i).statusindex == $scope.dataStatusprepare[k].id )
                {
                     $scope.labelsgraph.push($scope.dataStatusprepare[k].statusname);
                     $scope.datagraph.push(resstatus.rows.item(i).c);
                     $scope.colorsgraph.push($scope.dataStatusprepare[k].color);
                     $scope.sumOccforgraph.push({
                                            name: $scope.dataStatusprepare[k].statusname,
                                            amount: resstatus.rows.item(i).c,
                                            colorg: $scope.dataStatusprepare[k].color
                                        });

                    }
                 }
                 else
                 {
                     if (resstatus.rows.item(i).statusindex == $scope.dataStatusprepare[k].id )
                    {
                     $scope.labelsgraph.push("ไม่ระบุ");
                     $scope.datagraph.push(resstatus.rows.item(i).c);
                     $scope.colorsgraph.push($scope.dataStatusprepare[k].color);
                     $scope.sumOccforgraph.push({
                                            name: "ไม่ระบุ",
                                            amount: resstatus.rows.item(i).c,
                                            colorg: $scope.dataStatusprepare[k].color
                                        });

                    }


                 }

            }


         }
        
        if($scope.sumOccforgraph.length == 0)
        {
            $scope.showgraphintro = false;
        }
        //$scope.modalshowgraphresult.show();
        var modalOptions = {scope:$scope, animation: 'slide-in-up'};
        $ionicModal.fromTemplateUrl('templates/showgraphbyperiod.html', modalOptions).then(function(dialog) {
        $scope.modalshowgraphresult = dialog;
        $scope.modalshowgraphresult.show();
        });

         }, function (err) {
             alert("มีข้อผิดพลาด" + err);
         });

    $scope.datashowgraphLoaded = true;
    };

     function chunkedData2(arr) {
                      var newArr = "";
                      var resultsex = 0;
                        newArr = arr.slice(0, 3);
                        if(newArr == 'นาย')
                        {
                            resultsex = 1;
                        }
                        if(newArr == 'นาง')
                        {
                            resultsex = 2;
                        }
                        if(newArr == 'น.ส')
                        {
                            resultsex = 5;
                        }
                      newArr = arr.slice(0, 4);
                       if(newArr == 'ด.ช.')
                        {
                            resultsex = 3;
                        }
                        if(newArr == 'ด.ญ.')
                        {
                            resultsex = 4;
                        }
                    newArr = arr.slice(0, 7);
                       if(newArr == 'เด็กชาย')
                        {
                            resultsex = 7;
                        }
                        newArr = arr.slice(0,8);
                        if(newArr == 'เด็กหญิง')
                        {
                            resultsex = 8;
                        }
                     
                     return resultsex;
                };



    $scope.deleteClass = function(data){
        
          $ionicPopup.show({
                title: 'ยืนยันการลบ',
                template: "คุณแน่ใจที่จะลบคาบเรียนนี้ใช่หรือไม่",
                buttons: [
                    {
                        text: 'ตกลง',
                        type: 'button-positive',
                        onTap: function () {
                            var q1 = "DELETE FROM course_"+ $scope.cid + " where datestimeindex = ?";
                            $cordovaSQLite.execute(db, q1, [data.id]);
                            var q2 = "delete from class where id = ?";
                            $cordovaSQLite.execute(db, q2, [data.id]);
                            changeclass = true;
                            getListClass();
  
                        }
                    },
                    {
                        text: 'ยกเลิก',
                        type: 'button-assertive',
                        onTap: function () {
                            //$scope.modalEdit.show();
                        }
                    }
                ]
            });
        };


    $scope.deleteAllClass = function(){
        $scope.closeClass();
        if($scope.dataClass.length === 0){
            $ionicPopup.show({
                title: 'ข้อความ',
                template: "ขณะนี้ไม่มีคาบเรียนให้ลบ",
                buttons: [
                    {
                        text: 'ตกลง',
                        type: 'button-positive',
                        onTap: function () {
                        }
                    }
                ]
            });
        }// end if
        else{
            $ionicPopup.show({
                title: 'ยืนยันการลบ',
                template: "คุณแน่ใจที่จะลบคาบเรียนทั้งหมดนี้ใช่หรือไม่",
                buttons: [
                    {
                        text: 'ตกลง',
                        type: 'button-positive',
                        onTap: function () {
                            var q1 = "DELETE FROM course_"+ $scope.cid + " where course_index = ?";
                            var q2 = "DELETE FROM class where ccla_index = ?";
                            $cordovaSQLite.execute(db, q1,[$scope.cid]);
                            $cordovaSQLite.execute(db, q2,[$scope.cid]);
                            $ionicHistory.clearCache();
                            getListClass();
                        }
                    },
                    {
                        text: 'ยกเลิก',
                        type: 'button-assertive',
                        onTap: function () {
                            //$scope.modalEdit.show();
                        }
                    }
                ]
            });
        } // end else
        
    };

    }); // end of courseCtrl

app.controller('reportCtrl',function ($state,$ionicLoading,$scope,$filter,$http,$cordovaSQLite,$cordovaFile, $ionicModal,$ionicPopover, $ionicFilterBar, $timeout, $ionicPopup,$location,$cordovaDatePicker,$ionicPlatform,$cordovaBarcodeScanner,$ionicHistory){
 $scope.cid = $state.params.id;
 $scope.dataoccurr = [];
 $scope.datas = [];
var filterBarInstance;
$scope.show = function() {
             $ionicLoading.show({
                 template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                 });
         };

        $scope.hide = function(){
        $ionicLoading.hide();
         };
$ionicPlatform.registerBackButtonAction(function (event) {   
                
                if($state.current.name=="reportbyperson")
                  {
                        
                        $scope.gotoreport();

                  }
                  
                
                  
                  
                }, 100);
$scope.$on("$ionicView.beforeEnter", function(event, toState){
   
    if($state.current.name=="reportbyperson")
    {
       $scope.show($ionicLoading); 
    }
 });
$scope.$on("$ionicView.afterEnter", function(event, toState){
   
    if($state.current.name=="reportbyperson")
    {
        $scope.hide($ionicLoading);
    }
 });


getList();
GetReport();
getoccurence();

function getList() {
            $cordovaSQLite.execute(db, 'SELECT * FROM student where cstu_index =? order by cast(stdid as unsigned) asc, stdnamelastnameThai asc',[$scope.cid]).then(function (res) {
                 $scope.datas = [];
                if (res.rows.length > 0)
                {
                
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.datas.push(res.rows.item(i));
                }
                 
                }
                else
                {
                   
                }
            }, function (err) {
                console.log(err.message);
        
            });
            
        };
$scope.sortClasstable = function(data) {
        var date = new Date(data.Datevalue);
        return date;
    };
function GetReport(){
          
          $scope.datareportLoaded = false; 
          $scope.datareportLoadedintro = true;        
          $scope.datareportfinal = [];
          var index_std = "";
          var nameThai = "";
          var stdNum = "";
          var showclass ="";
          var forcalpresent = 0;
          var forcalabsent = 0;
          var percent = 0;
          var ids = [];      
        var q3 = "SELECT *, COUNT(*) as c FROM (SELECT * FROM course_" + $scope.cid + " INNER JOIN  student ON (course_" + $scope.cid + ".stdindex_rec = student.id)" + "INNER JOIN status ON (status.id =  course_" + $scope.cid + ".statusindex)" + " where course_" + $scope.cid + ".course_index = ? ) group by stdid, statusindex ";
        $cordovaSQLite.execute(db, q3,[$scope.cid]).then(function (res) {
            if(res.rows.length > 0)
            {
                 $scope.datareportLoadedintro = true;

            } else
            {

                $scope.datareportLoadedintro = false;
            }
           
            for (var j= 0; j< $scope.datas.length;j++ ){
                forcalpresent = 0;
                forcalabsent = 0;
                percent  = 0;
                showclass ="";

            for (var i = 0; i < res.rows.length; i++) 
                    {
       
                                if ($scope.datas[j].stdid == res.rows.item(i).stdid)
                                {
                                    index_std = res.rows.item(i).stdindex_rec;
                                    nameThai = res.rows.item(i).stdnamelastnameThai;
                                    stdNum = res.rows.item(i).stdid;
                                   
                                    if(res.rows.item(i).calpresent === 1)
                                    {
                                            forcalpresent = forcalpresent + res.rows.item(i).c;
                                    }
                                    if(res.rows.item(i).calpresent === 0)
                                    {
                                            forcalabsent = forcalabsent + res.rows.item(i).c;
                                    }

                                    if(res.rows.item(i).statusname !== 'ไม่ระบุ')
                                    {
                                    ids.push({ 
                                        value: res.rows.item(i).statusname,
                                        count: res.rows.item(i).c,
                                        color: res.rows.item(i).color });
                                    }
                                    else
                                    {
                                         ids.push({ 
                                        value: "ไม่ระบุ",
                                        count: res.rows.item(i).c,
                                        color: res.rows.item(i).color });

                                    }
                                }
                            

                    } // end for i
                        
                        if(nameThai !== "")
                            {
                                    percent = ((forcalpresent * 100) / (forcalpresent + forcalabsent)).toFixed(0); 
                                    if(percent == 100 )
                                    {
                                       showclass = "buttoncirclegreen"; 
                                    }
                                    
                                    if(percent < 80 )
                                    {
                                         showclass = "buttoncirclered";
                                    } 
                                    if(percent >= 80 && percent <= 90  )
                                    {

                                         showclass = "buttoncircleblue";
                                    }

                                    $scope.datareportfinal.push({
                                    indexstd: index_std,
                                    name: nameThai,
                                    stdID:  stdNum,
                                    amountpresent: forcalpresent,
                                    amountabsent: forcalabsent,
                                    showpercent: percent,
                                    showclasscolor: showclass,
                                    id: ids
                                     });
                             }
                        
                        // reset
                        index_std="";
                        nameThai = "";
                        stdNum = "";
                        ids = [];
                        

                    } // end for j
                //console.log($scope.datareportfinal);
                $scope.datareportLoaded = true; 
               
            }, function (err) {
                alert('มีข้อผิดพลาด' + err.message);
                $scope.datareportLoaded = true; 
            });

        };
$scope.gotoreport = function() {
         navigator.vibrate(40);
        $scope.linkreport = "#/selectreport/" + $scope.cid; 
        //$ionicHistory.clearCache().then(function(){ window.location.href= $scope.linkreport; });
        window.location.href= $scope.linkreport; 
 
        };

$scope.chunkedData = function(arr) {
                      var newArr = "";
                      var resultsex = 0;
                        newArr = arr.slice(0, 3);
                        if(newArr == 'นาย')
                        {
                            resultsex = 1;
                        }
                        if(newArr == 'นาง')
                        {
                            resultsex = 2;
                        }
                        if(newArr == 'น.ส')
                        {
                            resultsex = 5;
                        }
                      newArr = arr.slice(0, 4);
                       if(newArr == 'ด.ช.')
                        {
                            resultsex = 3;
                        }
                        if(newArr == 'ด.ญ.')
                        {
                            resultsex = 4;
                        }
                        newArr = arr.slice(0, 7);
                       if(newArr == 'เด็กชาย')
                        {
                            resultsex = 7;
                        }
                        newArr = arr.slice(0,8);
                        if(newArr == 'เด็กหญิง')
                        {
                            resultsex = 8;
                        }
                     
                     return resultsex;
                };

 $ionicModal.fromTemplateUrl('templates/show_table_occurr_by_std.html', {
            scope: $scope,
            //hardwareBackButtonClose: false
        }).then(function (modal) {

            $scope.modalshowtableoccurr = modal;
        });
 $scope.closeshowtableoccurr = function () {
            //$scope.modalshowtableoccurr.hide();
            $scope.modalshowtableoccurr.remove();
        };
         /*$scope.$on('$destroy', function() {
             $scope.modalshowtableoccurr.remove();
        });*/
$scope.showtable = function(indexstd) {

        $scope.datashowtableLoaded = false;
        $scope.showtableintro = true;
        $scope.datatableoccurrbydate = [];
        $scope.dataoccurrechper = [];
        $scope.namestd = "";
        $scope.idstd = "";
        $scope.imageid = 0;
        var idexportfinal = [];  
        var smatch =  false;

    var q3 = "SELECT * FROM (SELECT * FROM course_" + $scope.cid + " INNER JOIN  student ON (course_" + $scope.cid  +".stdindex_rec = student.id)" + "INNER JOIN status ON (status.id =  course_" + $scope.cid + ".statusindex)" + "INNER JOIN class ON (class.id =  course_" + $scope.cid + ".datestimeindex)" + " where course_" + $scope.cid + ".course_index = ? and student.id = ?) order by datestimeindex";
    $cordovaSQLite.execute(db, q3,[$scope.cid,indexstd]).then(function (res) {

       if(res.rows.length === 0)
       {
        $scope.showtableintro = false;
       }
       if(res.rows.length > 0)
       {
           

               for (var i = 0; i < res.rows.length; i++) {
                     $scope.namestd = res.rows.item(i).stdnamelastnameThai;
                     $scope.idstd = res.rows.item(i).stdid;
                     
                      for (var m= 0; m<$scope.dataoccurr.length;m++ )
                        {
                                     match =false;
                                     
                                          // if($scope.dataoccurr[m].statusname  !=='สถานะ')
                                          // {
                                            if ($scope.dataoccurr[m].statusname ==  res.rows.item(i).statusname)

                                                {
                                                    
                                                    match = true;
                                                    idexportfinal.push({ 
                                                        value: 1});
                                                }

                                    

                                             if(!match)
                                             {
                                                 idexportfinal.push({ 
                                                        value: 0});
                                            }
                                       // }
                                             
                           

                        }
                           //if(res.rows.item(i).statusname !== 'สถานะ')
                           //{
                                  $scope.imageid = chunkedData2(res.rows.item(i).stdnamelastnameThai); 
                                  $scope.datatableoccurrbydate.push({
                                            Datevalue: res.rows.item(i).datestime,
                                            arrayocc: idexportfinal
                                     });
                           //}
                        
                    idexportfinal = [];
                   
               }
            
            
            $scope.datashowtableLoaded = true;

         }

    },
                function(error) {
                    $scope.statusMessage = "Error on loading: " + error.message;
                }
            );
    //$scope.modalshowtableoccurr.show();
    var modalOptions = {scope:$scope, animation: 'slide-in-up'};
        $ionicModal.fromTemplateUrl('templates/show_table_occurr_by_std.html', modalOptions).then(function(dialog) {
        $scope.modalshowtableoccurr = dialog;
        $scope.modalshowtableoccurr.show();
        });
    };
 function chunkedData2(arr) {
                      var newArr = "";
                      var resultsex = 0;
                        newArr = arr.slice(0, 3);
                        if(newArr == 'นาย')
                        {
                            resultsex = 1;
                        }
                        if(newArr == 'นาง')
                        {
                            resultsex = 2;
                        }
                        if(newArr == 'น.ส')
                        {
                            resultsex = 5;
                        }
                      newArr = arr.slice(0, 4);
                       if(newArr == 'ด.ช.')
                        {
                            resultsex = 3;
                        }
                        if(newArr == 'ด.ญ.')
                        {
                            resultsex = 4;
                        }
                        newArr = arr.slice(0, 7);
                       if(newArr == 'เด็กชาย')
                        {
                            resultsex = 7;
                        }
                        newArr = arr.slice(0,8);
                        if(newArr == 'เด็กหญิง')
                        {
                            resultsex = 8;
                        }
                        
                     
                     return resultsex;
                };

function getoccurence() {
            
          $scope.dataoccurr = [];
          $scope.statuspresent= 0 ;

          $cordovaSQLite.execute(db, 'SELECT * FROM status where csta_index = ?',[$scope.cid]).then(function (res) {
                
                if(res.rows.length == 0)
                {
                   $scope.showoccurrintro = false;
                }
                
                for (var i = 0; i < res.rows.length; i++) {
                    if(res.rows.item(i).statusname !== 'ไม่ระบุ')
                    {
                        $scope.dataoccurr.push(res.rows.item(i));
                    }
                }
                for (var i = 0; i < res.rows.length; i++) {
                    if(res.rows.item(i).statusname === 'ไม่ระบุ')
                    {
                        $scope.dataoccurr.push(res.rows.item(i));
                    }
                }

            }, function (err) {
                console.log(err.message);           
            });
        
        };

 $scope.refreshItems = function () {
            if (filterBarInstance) {
                filterBarInstance();
                filterBarInstance = null;
            }
            $timeout(function () {
                getoccurence();
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
 $scope.showFilterBarresultperson = function () {
            //$scope.closesearch();
            if (filterBarInstance) {
                filterBarInstance();
                filterBarInstance = null;
            }
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.datareportfinal,
                update: function (filteredItems) {
                    $scope.datareportfinal = filteredItems;
                }
            });
        };

});

/*****************************************************************************************************/
app.controller('CheckclassCtrl',function ($state,$ionicPlatform,$ionicLoading,$scope,$filter,$http,$cordovaSQLite,$cordovaFile, $ionicModal,$ionicPopover, $ionicFilterBar, $timeout, $ionicPopup,$location,$cordovaDatePicker,$ionicPlatform,$cordovaBarcodeScanner,$ionicHistory,$ionicScrollDelegate){
 $scope.cid = $state.params.id;
 $scope.dt= $state.params.datestimeid;
 $scope.dtvalue = $state.params.datestimevalue;
 $scope.dataclassLoaded = false;
var filterBarInstance;
var changecheck = false;
$scope.show = function() {
             $ionicLoading.show({
                 template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                 });
         };

        $scope.hide = function(){
        $ionicLoading.hide();
         };

/********************************************************/
//$scope.$on("$ionicView.beforeEnter", function(event, toState){
   // handle event
    // console.log("State Params: ", toState);
  //  if($state.current.name=="eachclass")
  //  {
        $scope.dataclassLoaded = false;
        prepareStatus();
        getoccurence();
        CalclassOccurr(); 
        getListAll();
        //$scope.scrollTop();

    //}
 //});

/*******************************************************/
$ionicPlatform.registerBackButtonAction(function (event) {   
                if($state.current.name=="eachclass")
                  {
                      
                      $scope.goClassAttend();
                     
                  }
                  
                }, 100);
/*******************************************************/
$scope.refreshItemsAll = function () {
            if (filterBarInstance) {
                filterBarInstance();
                filterBarInstance = null;
            }
            $timeout(function () {
                getListAll();
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
/********************************************************/
$ionicPopover.fromTemplateUrl('templates/popovercaloccurrcheckall.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popoccurrcheckall = popover;
        });
$ionicPopover.fromTemplateUrl('templates/status.html', {
            scope: $scope

        }).then(function (popover) {
            $scope.popStatus = popover;
        });
$scope.closeStatus = function () {
       
            $scope.popStatus.hide();
            //$scope.popStatus.remove();
        };
$scope.$on('$destroy', function() {

            $scope.popStatus.remove();
        });
 $scope.openPopover = function($event) {

             CalclassOccurr();
             $scope.popcaloccurr.show($event);
        };
$ionicPopover.fromTemplateUrl('templates/popovercaloccurr.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popcaloccurr = popover;
        });
/**************************************************************************************************/
$scope.FilterEachClass = function () {
           changecheck = false;
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.alldatas,
                update: function (filteredItems) {
                    $scope.alldatas = filteredItems;
                    if(changecheck)
                    {
                        getListAll(); 
                    }
                },cancel : function () {
                    if(changecheck)
                    {
                       getListAll(); 
                    }
                   
                }
            });
        };


changecheck


/***************************************************************************************************/
function getoccurence() {
            
          $scope.dataoccurr = [];
          $scope.statuspresent= 0 ;

          $cordovaSQLite.execute(db, 'SELECT * FROM status where csta_index = ?',[$scope.cid]).then(function (res) {
                
                if(res.rows.length == 0)
                {
                   $scope.showoccurrintro = false;
                }
                
                for (var i = 0; i < res.rows.length; i++) {
                    if(res.rows.item(i).statusname !== 'ไม่ระบุ')
                    {
                        $scope.dataoccurr.push(res.rows.item(i));
                    }
                }
                for (var i = 0; i < res.rows.length; i++) {
                    if(res.rows.item(i).statusname === 'ไม่ระบุ')
                    {
                        $scope.dataoccurr.push(res.rows.item(i));
                    }
                }
                for (var i = 0; i < res.rows.length; i++) {
                    
                    if(res.rows.item(i).statusname == "มา")
                    {
                     
                     $scope.statuspresent = res.rows.item(i).id; 

                    }
                }

            }, function (err) {
                console.log(err.message);           
            });
        
        };

/**************************************************************************************************/
function prepareStatus () {
             $scope.dataStatusprepare = [];
             $cordovaSQLite.execute(db, 'SELECT * FROM status where csta_index = ?',[$scope.cid]).then(function (res) {
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.dataStatusprepare.push(res.rows.item(i));  
                }

                }, function (err) {
                    console.log(err.message);
            });
       };

/*************************************************************************************************/
$scope.goClassAttend = function() {
         var getbyid="";
         navigator.vibrate(40);   
         var check = false;
         var amountalert = 0;
          for (var j= 0; j< $scope.sumOcc.length;j++ ){
             if($scope.sumOcc[j].name == 'ไม่ระบุ')
             {
                check = true;
                amountalert = $scope.sumOcc[j].amount;
             }
          }
           if(check)
           {
             $ionicPopup.show({
                    title: 'แจ้งเตือน',
                    template: "ยังไม่ได้เช็คสถานะการเข้าเรียนจำนวน " + amountalert + " คน",
                    buttons: [
                        {
                            text: 'ตกลง',
                            type: 'button-positive',
                            onTap: function () {

                
                    /*for (var j = 0; j < $scope.alldatas.length; j++)
                    {

                       getbyid = $scope.cid+"_"+$scope.alldatas[j].id;
                       remove(getbyid);

                     } */                
                $scope.link1 = "#/course/" + $scope.cid + "/classattend"; 
                window.location.href= $scope.link1;
                            }
                        }
                    ]
                });


           }else
           {
                    /*for (var j = 0; j < $scope.alldatas.length; j++)
                    {

                       getbyid = $scope.cid+"_"+$scope.alldatas[j].id;
                       remove(getbyid);

                     } */    
                   $scope.link1 = "#/course/" + $scope.cid + "/classattend"; 
                   window.location.href= $scope.link1;
            }
        };
        /******************************************************************/
        function remove(id) {
            //console.log(id);
            var elem = document.getElementById(id);
            return elem.parentNode.removeChild(elem);
        }
        
        /*****************************************************************/
        function getStdandStatus(stid) {
            $scope.st = [];
            var q1 = "SELECT * FROM course_" + $scope.cid  + " where stdindex_rec = ? and course_index = ? and datestimeindex = ?";
            $cordovaSQLite.execute(db, q1 ,[stid,$scope.cid,$scope.dt]).then(function (res) {
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.st.push(res.rows.item(i));
                   
                }
            }, function (err) {
                console.log(err.message);
            });

            $cordovaSQLite.execute(db, 'SELECT * FROM student where cstu_index = ? ',[$scope.cid]).then(function (res) {
                $scope.dataAll = [];
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.dataAll.push(res.rows.item(i));
                }
                
            }, function (err) {
                console.log(err.message);
            });
        };
/*************************************************************************/
$scope.scanBarcode = function() {
         scanBarcodeprocess();
    };

function scanBarcodeprocess() {
 var stdindex;
 cordova.plugins.barcodeScanner.scan(
        function(result) {
            if( !result.cancelled ) {
                   
                    var query = "update course_" + $scope.cid + " set statusindex = ? where stdindex_rec = ? and course_index = ? and datestimeindex = ?";
                    var query1 = "select * from student where stdid = ? and cstu_index = ? "; 
                     $cordovaSQLite.execute(db,query1,[result.text,$scope.cid]).then(function(res) {
                            if( res.rows.length > 0)
                            {
                            
                                for (var i = 0; i < res.rows.length; i++) {
                                    stdindex = res.rows.item(i)['id'];
                                    //alert($scope.cid + " " +stdindex + " " + $scope.statuspresent + " " + $scope.dt);
                                }        
            
                                    $cordovaSQLite.execute(db, query, [$scope.statuspresent,stdindex,$scope.cid,$scope.dt]).then(function(res) {
                                            $ionicPopup.show({
                                            title: 'เช็คชื่อเข้าเรียน',
                                            template: "รหัส "+ result.text + " เช็คชื่อเข้าเรียนเรียบร้อยค่ะ",
                                            buttons: [
                                                {
                                                    text: 'สแกนต่อ',
                                                    type: 'button-positive',
                                                    onTap: function () {
                                                       //getStdandStatus(stdindex);
                                                       //prepareStatus();
                                                       //getoccurence();
                                                       CalclassOccurr(); 
                                                       getListAll();
                                                       scanBarcodeprocess();  
                                                        
                                                    }
                                                },
                                                {
                                                    text: 'กลับหน้าหลัก',
                                                    type: 'button-royal',
                                                    onTap: function () {
                                                       //getStdandStatus(stdindex);
                                                       CalclassOccurr();
                                                       getListAll();
                                                    }
                                                }
                                            ]
                                        });
                 
                                        }, function (err) {
                                            alert('ERROR' + err.message);
                                        });
                            }
                            else
                            {

                                    $ionicPopup.show({
                                            title: 'แจ้งเตือน',
                                            template: "ไม่มีข้อมูลรหัส "+ result.text ,
                                            buttons: [
                                                {
                                                    text: 'ตกลง',
                                                    type: 'button-positive',
                                                    onTap: function () {
                                                       //
                                                       scanBarcodeprocess();  
                                                        
                                                    }
                                                }
                                                
                                            ]
                                        });


                            }

                                    });
            }
            else
            {
               $ionicPlatform.registerBackButtonAction(function(event) {
               //$state.go('eachclass');
                
              }, 101);




            }
        },
        function(error) {
            //alert("Scanning failed: " + error);
        },
        {
          prompt : "Place a barcode inside the scan area", // Android
          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
          disableAnimations : true // iOS
      }
    );
};
/***************************************************************************/
function CalclassOccurr() {
         $scope.labels = [];
         $scope.datag = [];
         $scope.colors = [];
         var query  = "SELECT statusindex,count(*) as c FROM course_" + $scope.cid  + " where course_index = ? and datestimeindex = ? group by statusindex";
         $scope.sumOcc =[];
         $cordovaSQLite.execute(db, query ,[$scope.cid,$scope.dt]).then(function (resstatus) {
         for (var i = 0; i < resstatus.rows.length; i++) {
            for(var k = 0; k < $scope.dataStatusprepare.length; k++)
            {
                if (resstatus.rows.item(i).statusindex == $scope.dataStatusprepare[k].id )
                {
                     $scope.labels.push($scope.dataStatusprepare[k].statusname);
                     $scope.datag.push(resstatus.rows.item(i).c);
                     $scope.colors.push($scope.dataStatusprepare[k].color);
                     $scope.sumOcc.push({
                                            name: $scope.dataStatusprepare[k].statusname,
                                            amount: resstatus.rows.item(i).c,
                                            colorg: $scope.dataStatusprepare[k].color
                                        });

                }

            }

           
         }

         }, function (err) {
                console.log(err.message);
        
         });
         
    };
/************************************************************************************************/
$scope.CheckAll= function(id,name) {
    $ionicPopup.show({
                title: 'ข้อความ',
                template: "เช็คสถานะนักศึกษา "+name +" ทุกคน",
                buttons: [
                    {
                        text: 'ตกลง',
                        type: 'button-positive',
                        onTap: function () {
                $scope.popoccurrcheckall.hide();
                var query = "update course_" + $scope.cid  + " set statusindex = ? where course_index = ? and datestimeindex = ?";
                $cordovaSQLite.execute(db, query, [id,$scope.cid,$scope.dt]).then(function(res) {
                //$scope.refreshItemsAll();
                getListAll();
                CalclassOccurr();
            }, function (err) {
                alert('มีข้อผิดพลาด' + err.message);
            });
                           
                        
                        


                        }
                    },
                    {
                        text: 'ยกเลิก',
                        type: 'button-assertive',
                        onTap: function () {
                            //$scope.modalEdit.show();
                        }
                    }
                ]
            });
         
    };
  /****************************************************************************/
  $scope.chunkedData = function(arr) {
                      var newArr = "";
                      var resultsex = 0;
                        newArr = arr.slice(0, 3);
                        if(newArr == 'นาย')
                        {
                            resultsex = 1;
                        }
                        if(newArr == 'นาง')
                        {
                            resultsex = 2;
                        }
                        if(newArr == 'น.ส')
                        {
                            resultsex = 5;
                        }
                      newArr = arr.slice(0, 4);
                       if(newArr == 'ด.ช.')
                        {
                            resultsex = 3;
                        }
                        if(newArr == 'ด.ญ.')
                        {
                            resultsex = 4;
                        }
                       newArr = arr.slice(0, 7);
                       if(newArr == 'เด็กชาย')
                        {
                            resultsex = 7;
                        }
                        newArr = arr.slice(0,8);
                        if(newArr == 'เด็กหญิง')
                        {
                            resultsex = 8;
                        }
                     
                     return resultsex;
                };
/*******************************************************************************/
$scope.scrollTop = function() {
    $ionicScrollDelegate.scrollTop();
  };
/******************************************************************************/
function getListAll(){
            $scope.dataclassLoaded = false;
            $scope.showclassintro = true;
            $scope.alldatas = [];
            var query = "SELECT * FROM course_" + $scope.cid + " inner join student on (course_" + $scope.cid + ".stdindex_rec = student.id) where course_" + $scope.cid + ".course_index = ?  and datestimeindex = ? order by student.stdid asc";
            $cordovaSQLite.execute(db, query ,[$scope.cid,$scope.dt]).then(function (res) {
                //console.log(res.rows.length);
                if(res.rows.length == 0)
                {
                   $scope.showclassintro = false;
                   $scope.dataclassLoaded = true;
                   $scope.scrollTop();
                } else
                {
                for (var i = 0; i < res.rows.length; i++) {
                    for (var j = 0; j < $scope.dataStatusprepare.length; j++)
                    {

                        if (res.rows.item(i).statusindex == $scope.dataStatusprepare[j].id)
                            {
                                
                                $scope.alldatas.push({

                                        id: res.rows.item(i).idc,
                                        course_index: res.rows.item(i).course_index,
                                        datestime: res.rows.item(i).datestime,
                                        statusindex: res.rows.item(i).statusindex,
                                        stdid: res.rows.item(i).stdid,
                                        stdnameThai: res.rows.item(i).stdnamelastnameThai,
                                        color: $scope.dataStatusprepare[j].color,
                                        status: $scope.dataStatusprepare[j].statusname,
                                        stdindex: res.rows.item(i).stdindex_rec,

                                });

                            }  

                    }
                    
                }
                //$scope.$apply();;
                //$scope.refreshItemsAll();
                $scope.dataclassLoaded = true;
            }
                
            }, function (err) {
                $scope.dataclassLoaded = true;
                
            });
         //check จำนวน มาเรียน
            //$scope.dataclassLoaded = true;
        };
$scope.goCheck = function (indexcolor,info,stid,colorforbutton){
            //alert(indexcolor+" "+info+" "+stid+" "+colorforbutton);
            //var query = "update course_" + $scope.cid + " set statusindex = ? where stdindex_rec = ? and course_index = ? and datestimeindex = ?";
            var idb = $scope.cid+"_"+stid;
            $scope.closeStatus();
            var query = "update course_" + $scope.cid + " set statusindex = ? where idc = ?";
                $cordovaSQLite.execute(db, query, [indexcolor,stid]).then(function(res) {
                changecheck = true;
                document.getElementById(idb).innerText = info;
                document.getElementById(idb).style.background = colorforbutton;
                idbutton = "";
                CalclassOccurr();
            }, function (err) {
                alert('มีข้อผิดพลาด' + err.message);
            });

            getStdandStatus(stid);
                       
        };
        $scope.showcal = function ($event) {
            //DF = window.plugins.deviceFeedback;
            //DF.haptic(DF.VIRTUAL_KEY);
            navigator.vibrate(40);
            $scope.popcaloccurr.show($event);
        }
        
        $scope.goStatus = function ($event,studentid) {
            //DF = window.plugins.deviceFeedback;
            //DF.haptic(DF.VIRTUAL_KEY);
            //$scope.vib();
            navigator.vibrate(40);
            //idbutton = index;
            //console.log(idbutton);
                    angular.forEach($scope.dataoccurr, function(obj){
                        obj["stdid"] = studentid;
                    });
                    /*angular.forEach($scope.dataoccurr, function(obj){
                        obj["stdid"] = index;
                    });*/
            //$scope.vib();
            $scope.popStatus.show($event);
        };
});

/************************************************************************************************/

})();