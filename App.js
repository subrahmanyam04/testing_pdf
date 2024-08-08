
import React, {  useEffect } from 'react';

import { Platform, View, Text, TouchableOpacity, Alert, Linking } from 'react-native';

import RNFetchBlob from 'rn-fetch-blob';

import { PERMISSIONS, request, check, RESULTS, openSettings } from 'react-native-permissions';
 
const PdfDownloader = () => {

    useEffect(

        () => {

            if (Platform.OS === 'android') {

                checkAndRequestStoragePermissions();

            }

        }, []

    );
 
    const checkAndRequestStoragePermissions = async () => {

        try {

            console.log('Checking storage permissions...');

            const permission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
 
            const status = await check(permission);
 
            console.log(`Storage Permission Status: ${status}`);
 
            if (status !== RESULTS.GRANTED) {

                await requestStoragePermissions(permission);

            } else {

                console.log("Storage permissions are already granted");

            }

        } catch (err) {

            console.warn('Error checking storage permissions:', err);

        }

    };
 
    const requestStoragePermissions = async (permission) => {

        try {

            console.log('Requesting storage permissions...');

            const status = await request(permission);
 
            console.log(`Storage Permission Request Result: ${status}`);
 
            if (status === RESULTS.GRANTED) {

                console.log("Storage permissions granted");

            } else if (status === RESULTS.BLOCKED) {

                console.log("Storage permissions blocked");

                Alert.alert(

                    'Permissions Blocked',

                    'Storage permissions are blocked. Please go to settings and allow storage permissions for this app.',

                    [

                        {

                            text: 'Cancel',

                            style: 'cancel',

                        },

                        {

                            text: 'Open Settings',

                            onPress: () => openSettings(),

                        },

                    ]

                );

            } else {

                console.log("Storage permissions denied");

                Alert.alert('Permissions Denied', 'Storage permissions are required to download the PDF.');

            }

        } catch (err) {

            console.warn('Error requesting storage permissions:', err);

        }

    };
 
    const downloadPDF = async () => {

        const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

        const { config, fs } = RNFetchBlob;

        const downloadDest = `${fs.dirs.DownloadDir}/dummy.pdf`;
 
        const options = {

            fileCache: true,

            path: downloadDest,

            addAndroidDownloads: {

                useDownloadManager: true,

                notification: true,

                path: downloadDest,

                description: 'Downloading PDF file',

                mime: 'application/pdf',

                mediaScannable: true,

            }

        };
 
        try {

            console.log('Downloading PDF...');

            const response = await config(options).fetch('GET', pdfUrl);

            console.log('PDF downloaded to:', response.path());

            Alert.alert('PDF Downloaded', `PDF saved to: ${response.path()}`);

        } catch (error) {

            console.error('Error downloading PDF:', error);

            Alert.alert('Error', 'Error downloading PDF');

        }

    };
 
    return (

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

            <TouchableOpacity onPress={downloadPDF} style={{ padding: 20, backgroundColor: 'blue' }}>

                <Text style={{ color: 'white' }}>Download PDF</Text>

            </TouchableOpacity>

        </View>

    );

};
 
export default PdfDownloader;