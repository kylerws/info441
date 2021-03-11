import React from 'react';
import PageTypes from '../../Constants/PageTypes/PageTypes';
import MainPageContent from './Content/MainPageContent';
import SignOutButton from './Components/SignOutButton/SignOutButton';
import UpdateName from './Components/UpdateName/UpdateName';
// import UpdateAvatar from './Components/UpdateAvatar/UpdateAvatar';

const Main = ({ auth, page, setPage, setAuthToken, setUser, user }) => {
    let content = <></>
    let contentPage = true;
    switch (page) {
        case PageTypes.signedInMain:
            content = <MainPageContent auth={auth} user={user} setPage={setPage} />;
            break;
        case PageTypes.signedInUpdateName:
            content = <UpdateName user={user} setUser={setUser} setPage={setPage}/>;
            break;
        default:
            content = <><button onclick={(e) => setPage(e, PageTypes.signedInMain)}>Main</button></>;
            contentPage = false;
            break;
    }
    return <>
        {content}
        {/* {contentPage && <button onClick={(e) => setPage(e, PageTypes.signedInMain)}>Back to main</button>} */}
        <button onClick={(e) => setPage(e, PageTypes.signedInUpdateName)}>Edit Profile</button>
        <SignOutButton setUser={setUser} setAuthToken={setAuthToken} />
    </>
}

export default Main;