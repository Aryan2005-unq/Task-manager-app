import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { get, post } from "aws-amplify/api"; // For REST calls
import { createTodo, deleteTodo, updateTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import { onCreateTodo, onUpdateTodo, onDeleteTodo } from "./graphql/subscriptions";
import { CreateTodo } from "./components/CreateTodo";
import { TodoItem } from "./components/TodoItem";
import { Navbar } from "./components/Navbar";
import {
  withAuthenticator,
  Text,
  View,
  Flex,
  Badge,
  ThemeProvider,
  createTheme,
  Loader,
  Button
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";

const client = generateClient();

const customTheme = createTheme({
  name: 'taskmaster-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: '#eef2ff' },
          20: { value: '#e0e7ff' },
          40: { value: '#c7d2fe' },
          60: { value: '#818cf8' },
          80: { value: '#6366f1' },
          90: { value: '#4f46e5' },
          100: { value: '#4338ca' },
        },
      },
      font: {
        primary: { value: '{colors.neutral.100}' },
        secondary: { value: '{colors.neutral.80}' },
        tertiary: { value: '{colors.neutral.60}' },
      },
    },
    fonts: {
      default: {
        variable: { value: "'Inter', sans-serif" },
        static: { value: "'Inter', sans-serif" },
      },
    },
    radii: {
      small: { value: '8px' },
      medium: { value: '12px' },
      large: { value: '16px' },
    },
    shadows: {
      small: { value: '0 1px 2px rgba(0, 0, 0, 0.05)' },
      medium: { value: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)' },
      large: { value: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)' },
    },
    space: {
      xxxs: { value: '0.25rem' },
      xxs: { value: '0.375rem' },
      xs: { value: '0.5rem' },
      small: { value: '0.75rem' },
      medium: { value: '1rem' },
      large: { value: '1.5rem' },
      xl: { value: '2rem' },
    },
  },
  overrides: [
    {
      colorMode: 'dark',
      tokens: {
        colors: {
          background: {
            primary: { value: '#1e293b' },
            secondary: { value: '#0f172a' },
            tertiary: { value: '#334155' },
          },
          font: {
            primary: { value: '#f1f5f9' },
            secondary: { value: '#cbd5e1' },
            tertiary: { value: '#94a3b8' },
          },
          border: {
            primary: { value: '#334155' },
            secondary: { value: '#475569' },
            tertiary: { value: '#1e293b' },
          },
          brand: {
            primary: {
              10: { value: '#1e1b4b' },
              20: { value: '#312e81' },
              40: { value: '#4338ca' },
              60: { value: '#6366f1' },
              80: { value: '#818cf8' },
              90: { value: '#a5b4fc' },
              100: { value: '#c7d2fe' },
            },
          },
        },
        shadows: {
          small: { value: '0 1px 2px rgba(0, 0, 0, 0.3)' },
          medium: { value: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)' },
          large: { value: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)' },
        },
      },
    },
  ],
});

function App({ signOut, user }) {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("tasks"); // "tasks", "create", "completed"
  const [searchQuery, setSearchQuery] = useState("");
  const [themeMode, setThemeMode] = useState("light");

  useEffect(() => {
    fetchTodos();

    // Real-time Subscriptions
    const subCreate = client.graphql({ query: onCreateTodo }).subscribe({
      next: ({ data }) => {
        setTodos((prev) => {
          // If optimistic update is already there, don't duplicate
          if (prev.some(t => t.id === data.onCreateTodo.id)) return prev;
          return [...prev.filter(t => !t.id.startsWith('temp-')), data.onCreateTodo];
        });
      },
      error: (err) => console.log(err)
    });

    const subUpdate = client.graphql({ query: onUpdateTodo }).subscribe({
      next: ({ data }) => setTodos((prev) => 
        prev.map(t => t.id === data.onUpdateTodo.id ? data.onUpdateTodo : t)
      ),
      error: (err) => console.log(err)
    });

    const subDelete = client.graphql({ query: onDeleteTodo }).subscribe({
      next: ({ data }) => setTodos((prev) => 
        prev.filter(t => t.id !== data.onDeleteTodo.id)
      ),
      error: (err) => console.log(err)
    });

    return () => {
      subCreate.unsubscribe();
      subUpdate.unsubscribe();
      subDelete.unsubscribe();
    };
  }, []);

  async function fetchTodos() {
    setIsLoading(true);
    try {
      const todoData = await client.graphql({ query: listTodos });
      const todosFromAPI = todoData.data.listTodos.items;
      setTodos(todosFromAPI);
    } catch (err) {
      console.error("Error fetching todos", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function addTodo(todoPayload) {
    try {
      const prevTodos = [...todos];
      const tempId = `temp-${Date.now()}`;
      setTodos([...prevTodos, { ...todoPayload, id: tempId }]);

      await client.graphql({
        query: createTodo,
        variables: { input: todoPayload }
      });
      fetchTodos();
    } catch (err) {
      console.error("Error adding todo", err);
      alert("Failed to add todo: " + (err.errors?.[0]?.message || err.message));
      fetchTodos();
    }
  }

  async function handleUpdateTodo(todoPayload) {
    try {
      setTodos(todos.map(t => t.id === todoPayload.id ? todoPayload : t));
      const input = {
        id: todoPayload.id,
        name: todoPayload.name,
        description: todoPayload.description,
        isCompleted: todoPayload.isCompleted,
        filePath: todoPayload.filePath,
        priority: todoPayload.priority,
        dueDate: todoPayload.dueDate
      };
      
      await client.graphql({
        query: updateTodo,
        variables: { input }
      });
    } catch (err) {
      console.error("Error updating todo", err);
      alert("Failed to update todo: " + (err.errors?.[0]?.message || err.message));
      fetchTodos();
    }
  }

  async function removeTodo(id) {
    try {
      setTodos(todos.filter((todo) => todo.id !== id));
      await client.graphql({
        query: deleteTodo,
        variables: { input: { id } }
      });
    } catch (err) {
      console.error("Error deleting todo", err);
      alert("Failed to delete todo: " + (err.errors?.[0]?.message || err.message));
      fetchTodos();
    }
  }

  let filteredTodos = todos.filter(todo => {
    if (currentView === "completed") return todo.isCompleted;
    if (currentView === "tasks") return !todo.isCompleted;
    return true; 
  });

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredTodos = filteredTodos.filter(todo => 
      todo.name.toLowerCase().includes(q) || 
      (todo.description && todo.description.toLowerCase().includes(q))
    );
  }

  // Sort upcoming due dates first
  filteredTodos.sort((a, b) => {
    if (currentView === "completed") return 0; // Don't sort completed tasks necessarily
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0; // Same, leave default order
  });

  return (
    <ThemeProvider theme={customTheme} colorMode={themeMode}>
      <Flex direction="column" minHeight="100vh" backgroundColor="var(--amplify-colors-background-secondary)">
        <Navbar 
          currentView={currentView} 
          setView={setCurrentView} 
          user={user} 
          signOut={signOut}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
        />
        
        <View className="taskmaster-content" padding="2rem" width="100%" maxWidth="900px" margin="0 auto">
          {currentView === "create" && (
            <Flex direction="column" alignItems="center">
               <View width="100%">
                 <Text className="taskmaster-section-title" fontSize="1.5rem" fontWeight="bold" marginBottom="1rem" textAlign="center" color="font.primary">Add a New Task</Text>
                 <CreateTodo onTodoCreated={(t) => { addTodo(t); setCurrentView("tasks"); }} />
               </View>
            </Flex>
          )}

          {(currentView === "tasks" || currentView === "completed") && (
            <View width="100%">
              <View className="section-header">
                <Text className="taskmaster-section-title" fontSize="1.5rem" fontWeight="bold" color="font.primary">
                  {currentView === "completed" ? "✅ Completed Tasks" : "📋 Active Tasks"} 
                  {!isLoading && (
                    <Badge className="task-count-badge" size="small" variation="info" marginLeft="0.5rem">{filteredTodos.length}</Badge>
                  )}
                </Text>
              </View>
              
              {isLoading ? (
                <Flex className="loading-container" justifyContent="center" padding="3rem"><Loader size="large" /></Flex>
              ) : filteredTodos.length === 0 ? (
                <View className="empty-state">
                  <Text className="empty-state-icon" aria-hidden="true">
                    {currentView === "completed" ? "🏆" : "🎯"}
                  </Text>
                  <Text className="empty-state-title" color="font.primary">
                    {currentView === "completed" ? "No completed tasks yet" : "All clear! No active tasks"}
                  </Text>
                  <Text className="empty-state-subtitle" color="font.tertiary">
                    {currentView === "completed" 
                      ? "Complete some tasks and they'll appear here" 
                      : "Click \"+ Add New Task\" to get started"}
                  </Text>
                </View>
              ) : (
                <Flex direction="column" gap="1rem">
                  {filteredTodos.map((todo) => (
                    <TodoItem 
                      key={todo.id} 
                      todo={todo} 
                      onUpdate={handleUpdateTodo} 
                      onDelete={removeTodo} 
                    />
                  ))}
                </Flex>
              )}
            </View>
          )}
        </View>
      </Flex>
    </ThemeProvider>
  );
}

export default withAuthenticator(App);
