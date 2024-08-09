import { LightningElement, api, track, wire } from "lwc";

import communityId from "@salesforce/community/Id";
import communityBasePath from "@salesforce/community/basePath";
import getConnectNavigationItems from "@salesforce/apex/NavigationMenuController.setupNavigationMenu";
import getCurrentUserContactId from '@salesforce/apex/NavigationMenuController.getCurrentUserContactId';
import updateGeolocation from '@salesforce/apex/NavigationMenuController.updateGeolocation'; 
import { NavigationMixin } from "lightning/navigation";
import { showToastMessage } from "c/commonUtils";

import ICONS from "@salesforce/resourceUrl/WorldClinicMEIcons";

export default class CommunityCustomNavigation extends NavigationMixin(LightningElement) {
   
    @track _menuName = '';
    @track menuItems = [];
    @track showLoading = true;

    communityId = communityId;
    communityBasePath = communityBasePath;
    baseUrl;
    contactId;

    icons = ICONS;

    @api get menuName(){ return this._menuName; }
    set menuName(value){ /*this._menuName = value;*/ }

    connectedCallback() {
        let urlString = window.location.href;
        this.baseUrl = urlString.substring(0, urlString.indexOf("/s"));
        // console.log('baseUrl: ' + this.baseUrl);
        // console.log('menuName: ' + this._menuName);

        // if(navigator.geolocation){
        //     navigator.geolocation.getCurrentPosition(position => {
        //         console.log('lat: ' + position.coords.latitude);
        //         console.log('long: ' + position.coords.longitude);
                // showToastMessage('Location', 'lat/long: ' + position.coords.latitude + '/' + position.coords.longitude, 'success', 'dismissible', this);
            // })
        //}
    }

    @wire(getCurrentUserContactId)
    wiredCurrentUser({ error, data }) {
        if (data) {
            this.contactId = data;
            console.log(' this.contactId'+ this.contactId);
        } else if (error) {
            console.error('Error retrieving current user\'s contact ID: ', error);
        }
    }

    @wire(getConnectNavigationItems, {
        // menuName: '$_menuName',
        communityId: '$communityId'
    })
    wiredNavigationItems({ error, data }) {
        if (data) {
            let d = JSON.parse(JSON.stringify(data));
            for (let i = 0; i < d.length; i++) {
                d[i].navMenuLogo = this.icons + '/' + d[i].navMenuLogo;
                this.menuItems.push(d[i]);
            }
        } else if (error) {
            console.log('menu error: ' + JSON.stringify(error));
            this.error = error;
        }
        this.showLoading = false;
    }

    navigateToItem(event) {
        // console.log('MenuItem: ' , this.menuItems);
        // Get the menu item's label from the target
        let selectedLabel = event.currentTarget.dataset.label;
        // Loop through the menu items and get the row of the selected item
        let item = this.menuItems.filter(menuItem => menuItem.navLabel === selectedLabel)[0];

        // Distribute the action to the relevant mechanism for navigation
        if (item.navActionType === "ExternalLink") {
            this.navigateToExternalPage(item);
        } else if (item.navActionType === "InternalLink") {
            this.navigateToInternalPage(item);
        } else if (item.navActionType === "CallDoctor" || item.navActionType === "CallCareTeam") {
            this.callHotline(item);
            this.captureGeolocation(item.navActionType); // Capture geolocation when calling doctor or care team

            
        } 
    }

    // Open the external link
    navigateToExternalPage(item) {
        // console.log('navigateToExternalPage');
        const url = item.navAction;
        if (item.target === "CurrentWindow") {
            // console.log('navigating to ' + url);
            this[NavigationMixin.Navigate]({
                    type: "standard__webPage",
                    attributes: {
                    url: url
                }
            });
        } else if (item.target === "NewWindow") {
            window.open(url, "_blank");
        }
    }

    // Open an internal link
    navigateToInternalPage(item) {
        // console.log('navigateToInternalPage');

        let actionType = '';
        if(item.navAction.includes('contactRecordId')){
            actionType = item.navAction.replace('contactRecordId', this.contactId);
        } else {
            actionType = item.navAction;
        }

        const url = this.communityBasePath + actionType;
        const url2 = this.baseUrl + "/s" + actionType;

        this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: {
                url: url2
            }
        });
    }

    // Capture geolocation
    // captureGeolocation(action) {
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(
    //             position => {
    //                 const latitude = position.coords.latitude;
    //                 const longitude = position.coords.longitude;
    //                 console.log('latitude: ' + latitude);
    //                 console.log('longitude: ' + longitude);
    //                 this.updateContactGeolocation(latitude, longitude, action);
    //             },
    //             error => {
    //                 console.error('Error capturing geolocation:', error);
    //             },
    //             {
    //                 enableHighAccuracy: true, 
    //                 timeout: 10000,           
    //                 maximumAge: 0            
    //             }
    //         );
    //     } else {
    //         console.error('Geolocation is not supported by this browser.');
    //     }
    // }
    

    // Update contact's geolocation
    updateContactGeolocation(latitude, longitude, action) {
        updateGeolocation({ contactId: this.contactId, latitude, longitude, action })
            .then(result => {
                console.log('Geolocation updated successfully');
                
            })
            .catch(error => {
                console.error('Error updating geolocation: ', error);
            });
    }
   

    

    callHotline(item) {
        // showToastMessage('Outside Coverage Area.', 'Dialing Hotline - ' + item.hotline, 'success', 'dismissible', this);
        this[NavigationMixin.Navigate]({ type: 'standard__webPage', attributes: { url: "tel:" + item.navHotline } });  
    }










    // --------POC code------------
    apiKey = 'AIzaSyA6Tk4NaEvhbQu5Uie2H9SB7alCCR_e3CY';

    connectedCallback() {
        this.getUserLocation();
    }

    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this.handleSuccess.bind(this),
                this.handleError.bind(this)
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            this.isLoading = false;
        }
    }

    handleSuccess(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        this.userLocation = { latitude, longitude };
        this.isLoading = false;

        this.loadMap(latitude, longitude);

        this.up
    }

    handleError(error) {
        console.error('Error retrieving location:', error.message);
        this.isLoading = false;
    }

    loadMap(latitude, longitude) {
        // Find the container element
        const mapContainer = this.template.querySelector('.map-container');

        // Initialize the map
        const map = new google.maps.Map(mapContainer, {
            center: { lat: latitude, lng: longitude },
            zoom: 15
        });

        // Add a marker
        new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map
        });
    }
}