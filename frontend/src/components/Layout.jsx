import LeftSidebar from './LeftSidebar';
import MobileNavbar from './MobileNavbar';

const Layout = ({ children, showSidebar = true }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            {showSidebar && <LeftSidebar />}
            
            {/* Mobile Navigation */}
            <MobileNavbar />
            
            {/* Main Content */}
            <div className={`min-h-screen ${showSidebar ? 'lg:ml-64' : ''} pt-16 pb-20 lg:pt-0 lg:pb-0`}>
                {children}
            </div>
        </div>
    );
};

export default Layout;