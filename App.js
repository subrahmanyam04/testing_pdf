import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform, View, Text, TouchableOpacity, Alert } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFetchBlob from 'rn-fetch-blob';
import PushNotification from 'react-native-push-notification';

const PdfGenerator = () => {
    useEffect(() => {
        requestStoragePermission();
        configureNotification();
    }, []);

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "Storage Permission",
                        message: "This app needs access to your storage to download the PDF file.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("You can use the storage");
                } else {
                    console.log("Storage permission denied");
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    const configureNotification = () => {
        PushNotification.configure({
            onNotification: function (notification) {
                console.log("NOTIFICATION:", notification);
            },
            requestPermissions: Platform.OS === 'ios',
        });
    };

    const showNotification = (title, message) => {
        PushNotification.localNotification({
            title: title,
            message: message,
        });
    };

    const createPDF = async () => {
        const htmlContent = `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    h1 {
                        color: #333;
                    }
                    p {
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <h1>Title of PDF</h1>
                <p>This is a paragraph in the PDF.</p>
            </body>
            </html>
        `;

        const options = {
            html: htmlContent,
            fileName: 'example',
            directory: 'Documents',
        };

        try {
            // Generate the PDF file
            const file = await RNHTMLtoPDF.convert(options);

            // Define the path for downloading
            const imagePath = file.filePath;

            // Platform-specific configuration options
            const configOptions = Platform.select({
                ios: {
                    fileCache: true,
                    path: imagePath,
                    appendExt: 'pdf',
                },
                android: {
                    fileCache: true,
                    path: imagePath,
                    appendExt: 'pdf',
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: true,
                        path: imagePath,
                        description: 'PDF file',
                    },
                },
            });

            // Fetch the file using RNFetchBlob
            const response = await RNFetchBlob.config(configOptions).fetch('GET', file.filePath);

            // Notify the user that the download is complete
            showNotification('Download Complete', `PDF saved to: ${imagePath}`);

            Alert.alert('PDF Downloaded', `PDF saved to: ${response.path()}`);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Error creating or downloading PDF');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={createPDF} style={{ padding: 20, backgroundColor: 'blue' }}>
                <Text style={{ color: 'white' }}>Create and Download PDF</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PdfGenerator;
