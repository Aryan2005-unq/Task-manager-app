import { Flex, Menu, MenuItem, Button, MenuButton, Heading, Divider, SearchField, View } from '@aws-amplify/ui-react';

export function Navbar({ currentView, setView, user, signOut, searchQuery, setSearchQuery, themeMode, setThemeMode }) {
  return (
    <View className="taskmaster-navbar">
      <Flex 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        padding="1rem 2rem" 
        backgroundColor={themeMode === 'dark' 
          ? 'rgba(15, 23, 42, 0.85)' 
          : 'rgba(255, 255, 255, 0.85)'}
        width="100%"
        wrap="wrap"
        gap="0.75rem"
      >
        <Heading level={4} color="font.primary">TaskMaster App</Heading>
        
        {/* Search Bar */}
        <View className="navbar-search">
          <SearchField
            label="Search tasks"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            size="small"
            hasSearchButton={false}
          />
        </View>

        {/* Mega Menu Links */}
        <Flex direction="row" gap="0.5rem" alignItems="center" wrap="wrap">
          <Button 
            className={`navbar-nav-btn ${currentView === 'tasks' ? 'navbar-nav-btn--active' : ''}`}
            variation={currentView === 'tasks' ? 'primary' : 'link'} 
            onClick={() => setView('tasks')}
          >
            📋 Active Tasks
          </Button>
          <Button 
            className={`navbar-nav-btn ${currentView === 'completed' ? 'navbar-nav-btn--active' : ''}`}
            variation={currentView === 'completed' ? 'primary' : 'link'} 
            onClick={() => setView('completed')}
          >
            ✅ Completed
          </Button>
          <Button 
            className={`navbar-add-btn ${currentView === 'create' ? 'navbar-add-btn--active' : ''}`}
            variation={currentView === 'create' ? 'primary' : 'link'} 
            onClick={() => setView('create')}
          >
            + Add New Task
          </Button>
          
          {/* Dark Mode Toggle */}
          <Button 
            className="navbar-theme-toggle"
            size="small"
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            variation="link"
          >
            {themeMode === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </Button>

          {/* Dropdown Menu for User Actions */}
          <View className="navbar-profile-menu">
            <Menu trigger={<MenuButton variation="menu" marginLeft="0.5rem">👤 {user?.username}</MenuButton>}>
              <MenuItem onClick={() => setView('tasks')}>Dashboard</MenuItem>
              <MenuItem onClick={() => setView('create')}>New Task</MenuItem>
              <Divider />
              <MenuItem onClick={signOut} color="font.error">Sign Out</MenuItem>
            </Menu>
          </View>
        </Flex>
      </Flex>
    </View>
  );
}
