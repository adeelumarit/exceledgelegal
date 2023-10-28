// <reference path="messageread.js" />



var app = angular.module('edgelegal', ['ngMaterial', "ngRoute"], function () {


});


app.controller('edgelegalctrl', function ($scope, $mdDialog, $mdToast, $log, $location,) {
    var baseURL = "https://grazingdelights.com.au/LPDM/RT/WS";
    var dialogueURL ="https://adeelumarit.github.io/exceledgelegal/ExcelFileConverterWeb"
   //var dialogueURL ="https://localhost:44311"
    $scope.ShowMainDiv = false;
    $scope.wordMainDiv = true;
    $scope.loginBTN = false;

    var filecontent = "";
    let MatterNumberdialog;
    let logdialog;
    Office.onReady(function (info) {

    ProgressLinearActive();


    let userInfo = window.localStorage.getItem('userinfo');
    userInfo = JSON.parse(userInfo)
        let username = "";

        if (userInfo) {
            $scope.ShowMainDiv = false;
            $scope.userName = userInfo.username;
            

            if (info.host === Office.HostType.Excel) {

                $scope.ShowMainDiv = true;
                $scope.wordMainDiv = true
                ProgressLinearInActive();

                //loadtost("excel addin is wroking ")




            } else {
                $scope.ShowMainDiv = false;
                $scope.wordMainDiv = true;

                ProgressLinearInActive();

                loadtost("word addin is wroking ")
                loadtost("no functioanlities included yet")

            }

            ProgressLinearInActive();
            if (!$scope.$$phase) {
                $scope.$apply();
            }


        } else {
            
            $scope.ShowMainDiv = false;
            $scope.wordMainDiv = true;
            $scope.loginBTN = true;
            ProgressLinearInActive();
            openDialog();

            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }

  

        $scope.Login = function () {
            openDialog();
        }
    function openDialog() {

      
        Office.context.ui.displayDialogAsync(dialogueURL+`/Templates/Login.html`, { height: 50, width: 30 },
            function (asyncResult) {
                logdialog = asyncResult.value;
                logdialog.addEventHandler(Office.EventType.DialogMessageReceived, logprocess);
            }
        );
    }
       



        function logprocess(arg) {
            ProgressLinearActive();

        logdialog.close();
        console.log(arg)
        let message = JSON.parse(arg.message);
        //let userdata = message;
        //message = message.login;
        if (message.login === true) {
            console.log(message)
            window.localStorage.setItem('userinfo', JSON.stringify(message));

            //$scope.userName = userdata.userName
            loadToast("logged in successfully")



            //$scope.ShowMainDiv = true;
            //$scope.loginBTN = false;
            window.location.reload();
            ProgressLinearInActive();

            if (!$scope.$$phase) {
                $scope.$apply();
            }
            //$scope.Message = false;
        } else {
            //dialog.close();
            $scope.ShowMainDiv = false;
            $scope.loginBTN = true;
            ProgressLinearInActive();
            //loadToast("Refresh Addin To Login ")

            //$scope.Message = true;
        }
    }

       
        function getDocumentAsCompressed() {
            Office.context.document.getFileAsync(Office.FileType.Compressed, { sliceSize: 4194304  /*64 KB*/ }, function (result) {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    const myFile = result.value;
                    const sliceCount = myFile.sliceCount;
                    const docdataSlices = [];
                    let slicesReceived = 0;
                    let gotAllSlices = true;

                    // Get all the file slices.
                    getSliceAsync(myFile, 0, sliceCount, gotAllSlices, docdataSlices, slicesReceived);
                } else {
                    console.log("Error: " + result.error.message);
                }
            });
        }

        function getSliceAsync(file, nextSlice, sliceCount, gotAllSlices, docdataSlices, slicesReceived) {
            file.getSliceAsync(nextSlice, function (sliceResult) {
                if (sliceResult.status === Office.AsyncResultStatus.Succeeded) {
                    if (!gotAllSlices) {
                        return; // Failed to get all slices, no need to continue.
                    }

                    // Store the slice in a temporary array.
                    docdataSlices[sliceResult.value.index] = sliceResult.value.data;
                    slicesReceived++;

                    if (slicesReceived === sliceCount) {
                        file.closeAsync(function () {
                            onGotAllSlices(docdataSlices);
                        });
                    } else {
                        getSliceAsync(file, nextSlice + 1, sliceCount, gotAllSlices, docdataSlices, slicesReceived);
                    }
                } else {
                    gotAllSlices = false;
                    file.closeAsync(function () {
                        console.log("getSliceAsync Error: " + sliceResult.error.message);
                    });
                }
            });
        }

        function onGotAllSlices(docdataSlices) {
            let docdata = new Uint8Array(docdataSlices.reduce((acc, slice) => acc.concat(slice), []));

            const blob = new Blob([docdata], { type: "application/octet-stream" });
            const reader = new FileReader();

            reader.onloadend = function () {
                const base64Data = reader.result.split(',')[1];
                console.log(base64Data);
                if (base64Data) {
                    //file.closeAsync();
                    filecontent = base64Data;
                    Excel.run(function (context) {
                        var workbook = context.workbook;

                        workbook.load(["name"]);

                        return context.sync()
                            .then(function () {
                                // Access the workbook name
                                var workbookName = workbook.name;
                                $scope.Filename = workbookName;
                                Office.context.ui.displayDialogAsync(dialogueURL +`/Templates/MatterNumber.html?workbookName=${workbookName}`, { height: 50, width: 30 },
                                    function (asyncResult) {
                                        MatterNumberdialog = asyncResult.value;
                                        MatterNumberdialog.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
                                    }
                                );

                                //ProgressLinearInActive();
                                console.log("Active workbook name: " + workbookName);
                            })
                            .catch(function (error) {
                                console.log("Error: " + error);
                            });
                    }).catch(function (error) {
                        console.log("Error: " + error);
                    });
                }
                // Now you have the complete file data in base64 format.
                // You can use it as needed.
            };

            reader.readAsDataURL(blob);
        }



        //getDocumentAsCompressed();

        $scope.getFilebase64 = function (pdfvalue) {
            console.log(pdfvalue)
            getDocumentAsCompressed(pdfvalue);



        };


        $scope.GetFileAsPDF = function () {

            loadToast("working on pdf")
        }
           //return new Promise(function (resolve, reject) {
            //    Office.context.document.getFileAsync(Office.FileType.Compressed, { sliceSize: 4194304 }, function (result) {
            //        try {
            //            if (result.status === Office.AsyncResultStatus.Succeeded) {
            //                var file = result.value;
            //                var base64Data = "";
            //                var offset = 0;

            //                function readNextChunk() {
            //                    file.getSliceAsync(offset, function (sliceResult) {
            //                        if (sliceResult.status === Office.AsyncResultStatus.Succeeded) {
            //                            var dataSlice = sliceResult.value.data;
            //                            var reader = new FileReader();
            //                            reader.onloadend = function () {
            //                                base64Data += reader.result.split(',')[1];
            //                                offset += dataSlice.byteLength;
            //                                if (offset < file.size) {
            //                                    readNextChunk();
            //                                    file.closeAsync();

            //                                } else {



            //                                    resolve(base64Data);




            //                                    console.log(base64Data)
            //                                }
            //                            };
            //                            reader.readAsDataURL(new Blob([new Uint8Array(dataSlice)]));

            //                            file.closeAsync()
            //                        } else {
            //                            file.closeAsync()

            //                            reject(sliceResult.error);
            //                        }
            //                    });
            //                }

            //                readNextChunk();
            //            } else {
            //                reject(result.error);
            //                if (result.error.code === 5001) {

            //                    loadToast("Limit reached, try again to Reopen your document");
            //                }
            //            }
            //        } catch (error) {
            //            console.log(error);
            //            reject(error);
            //        }
            //    });
            //});

        function processMessage(arg) {
            ProgressLinearActive();

            MatterNumberdialog.close();

            console.log(arg)
            let message = JSON.parse(arg.message);
            if (message.close == true) {

                MatterNumberdialog.close();
                ProgressLinearInActive();

            } else {
                console.log(message)
                message.filecontent = filecontent;
                console.log(message);
                var form = new FormData();
                form.append("originalName", message.originalName);
                form.append("matterId", message.matternumber);
                form.append("userName", $scope.userName);
                form.append("", filecontent);
                //form.append("UserName", "Aamir");

                var settings = {
                    "url": baseURL+"/uploadMatterAttachmentV2",
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                        //"Cookie": username
                    },
                    "processData": false,
                    "mimeType": "multipart/form-data",
                    "contentType": false,
                    "data": form
                };

                $.ajax(settings).done(function (response) {
                    console.log(response);
                    loadToast("Uploaded Successfuly");
                    ProgressLinearInActive();
                }).fail(function (error) {

                    console.log(error);
                    loadToast("upload error");
                    ProgressLinearInActive();
                });
            }
        }

        //convertToPDF();

        //cc = function () {
        //    return new Promise(function (resolve, reject) {
        //        Office.context.document.getFileAsync(Office.FileType.Compressed, { sliceSize: 4194304 }, function (result) {
        //            try {
        //                if (result.status === Office.AsyncResultStatus.Succeeded) {
        //                    var file = result.value;
        //                    file.getSliceAsync(0, function (sliceResult) {
        //                        try {
        //                            if (sliceResult.status === Office.AsyncResultStatus.Succeeded) {
        //                                var dataSlice = sliceResult.value.data;
        //                                console.log(dataSlice)
        //                                var base64Data = btoa(String.fromCharCode.apply(null, new Uint8Array(dataSlice)));
        //                                console.log(base64Data);
        //                                resolve(base64Data);
        //                                $scope.CompilingDocumentasPDF(base64Data);
        //                                file.closeAsync()

        //                                // convertToPdfUsingAjax(base64Data);
        //                            } else {
        //                                file.closeAsync()

        //                                reject(sliceResult.error);

        //                            }
        //                        } catch (error) {
        //                                file.closeAsync()

        //                            if (error instanceof RangeError && error.message === "Maximum call stack size exceeded") {
        //                                loadToast("Opened Document size limit reached");
        //                            } else {
        //                                reject(error);
        //                            }
        //                        }
        //                    });
        //                } else {
        //                    reject(result.error);
        //                    if (result.error.code === 5001) {
        //                        loadToast("PDF Limit reached, try again to Reopen your document");
        //                    }
        //                }
        //            } catch (error) {
        //                reject(error);
        //            }
        //        });
        //    });
        //};
        //$scope.getFilebase64 = function (ev) {

        //    Office.context.document.getFileAsync(Office.FileType.Compressed, { sliceSize: 4194304},
        //        function (result) {
        //            if (result.status === "succeeded") {
        //                const myFile = result.value;
        //                myFile.getSliceAsync(0, function (result) {

        //                    let data = result.value.data
        //                    console.log(btoadata)


        //                    let btoadata = btoa(String.fromCharCode.apply(null, new Uint8Array(data)))

        //                    console.log(btoadata)

        //                    if (btoadata !="") {
        //                        myFile.closeAsync();
        //                        filecontent = btoadata;
        //                        Excel.run(function (context) {
        //                            var workbook = context.workbook;

        //                            workbook.load(["name"]);

        //                            return context.sync()
        //                                .then(function () {
        //                                    // Access the workbook name
        //                                    var workbookName = workbook.name;
        //                                    $scope.Filename = workbookName;
        //                                    Office.context.ui.displayDialogAsync(`https://localhost:44311/Templates/MatterNumber.html?workbookName=${workbookName}`, { height: 50, width: 30 },
        //                                        function (asyncResult) {
        //                                            MatterNumberdialog = asyncResult.value;
        //                                            MatterNumberdialog.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
        //                                        }
        //                                    );

        //                                    //ProgressLinearInActive();
        //                                    console.log("Active workbook name: " + workbookName);
        //                                })
        //                                .catch(function (error) {
        //                                    console.log("Error: " + error);
        //                                });
        //                        }).catch(function (error) {
        //                            console.log("Error: " + error);
        //                        });
        //                    }



        //                });

        //            } else {
        //                myFile.closeAsync()

        //                // Handle the error here
        //                //loadToast("Upload Error");
        //                //ProgressLinearInActive();

        //            }

        //        }
        //    );
        //}



    });
    $scope.Logout = function () {
        window.localStorage.clear();
        window.location.reload();
    }

    $scope.Help = function () {
        window.open("https://support.microsoft.com/en-us")
    }

        function ProgressLinearActive() {
            $("#StartProgressLinear").show(function () {

                $("#ProgressBgDiv").show();
                $scope.ddeterminateValue = 15;
                $scope.showProgressLinear = false;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        };
        function ProgressLinearInActive() {
            $("#StartProgressLinear").hide(function () {
                setTimeout(function () {
                    $scope.ddeterminateValue = 0;
                    $scope.showProgressLinear = true;
                    $("#ProgressBgDiv").hide();
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }, 500);
            });
        };
        function loadToast(alertMessage) {
            var el = document.querySelectorAll('#zoom');
            $mdToast.show(
                $mdToast.simple()
                    .textContent(alertMessage)
                    .position('bottom')
                    .hideDelay(4000))
                .then(function () {
                    $log.log('Toast dismissed.');
                }).catch(function () {
                    $log.log('Toast failed or was forced to close early by another toast.');
                });
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        if (!$scope.$$phase) {
            $scope.$apply();
        }

  
      
   
})
