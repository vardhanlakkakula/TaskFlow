import {
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [deadline, setDeadline] = useState("");
  const [reminder, setReminder] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [editingId, setEditingId] = useState(null);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleSwitchAccount = () => {
    logout();
    window.location.href = "/login";
  };

  const scrollToDashboard = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToMyTasks = () => {
    document
      .getElementById("my-tasks-section")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "Not set";
    }

    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fetchTodos = async () => {
    try {
      const response = await API.get("/todos");
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleCreateTodo = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      await API.post("/todos", {
        title,
        priority,
        deadline: deadline || null,
        reminder: reminder || null,
      });

      resetForm();
      fetchTodos();
    } catch (error) {
      console.error("Error creating todo:", error);

      alert(
        error.response?.data?.message ||
          "Failed to create todo"
      );
    }
  };

  const handleEditTodo = (todo) => {
    setEditingId(todo._id);
    setTitle(todo.title);
    setPriority(todo.priority || "Medium");

    setDeadline(
      todo.deadline
        ? new Date(todo.deadline)
            .toISOString()
            .slice(0, 16)
        : ""
    );

    setReminder(
      todo.reminder
        ? new Date(todo.reminder)
            .toISOString()
            .slice(0, 16)
        : ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleUpdateTodo = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      await API.put(`/todos/${editingId}`, {
        title,
        priority,
        deadline: deadline || null,
        reminder: reminder || null,
      });

      resetForm();
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update todo"
      );
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setPriority("Medium");
    setDeadline("");
    setReminder("");
  };

  const handleToggleTodo = async (todo) => {
    try {
      await API.put(`/todos/${todo._id}`, {
        completed: !todo.completed,
      });

      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update todo"
      );
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await API.delete(`/todos/${id}`);

      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete todo"
      );
    }
  };

  const isOverdue = (todo) => {
    if (!todo.deadline || todo.completed) {
      return false;
    }

    return new Date(todo.deadline) < new Date();
  };

  const isDueToday = (todo) => {
    if (!todo.deadline || todo.completed) {
      return false;
    }

    const deadlineDate = new Date(todo.deadline);
    const today = new Date();

    return (
      deadlineDate.getFullYear() === today.getFullYear() &&
      deadlineDate.getMonth() === today.getMonth() &&
      deadlineDate.getDate() === today.getDate()
    );
  };

  // =========================
  // STATISTICS
  // =========================

  const totalTodos = todos.length;

  const completedTodos = todos.filter(
    (todo) => todo.completed
  ).length;

  const pendingTodos = todos.filter(
    (todo) => !todo.completed
  ).length;

  const highPriorityTodos = todos.filter(
    (todo) =>
      todo.priority === "High" &&
      !todo.completed
  ).length;

  const overdueTodos = todos.filter(
    (todo) => isOverdue(todo)
  ).length;

  const dueTodayTodos = todos.filter(
    (todo) => isDueToday(todo)
  ).length;

  // =========================
  // FILTER TODOS
  // =========================

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    let matchesStatus = true;

    if (statusFilter === "Active") {
      matchesStatus = !todo.completed;
    }

    if (statusFilter === "Completed") {
      matchesStatus = todo.completed;
    }

    if (statusFilter === "Overdue") {
      matchesStatus = isOverdue(todo);
    }

    let matchesPriority = true;

    if (priorityFilter !== "All") {
      matchesPriority =
        todo.priority === priorityFilter;
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="tf-dashboard">

      {/* =========================
          SIDEBAR
      ========================== */}

      <aside className="tf-sidebar">

        {/* Brand */}

        <div className="tf-brand">

          <div className="tf-brand-icon">
            ✓
          </div>

          <div>
            <h2>TaskFlow</h2>
            <span>Productivity</span>
          </div>

        </div>

        {/* Navigation */}

        <div className="tf-sidebar-section">

          <span className="tf-sidebar-label">
            WORKSPACE
          </span>

          <nav className="tf-navigation">

            <button
              type="button"
              className="tf-nav-item tf-nav-active"
              onClick={scrollToDashboard}
            >
              <span className="tf-nav-icon">
                ▦
              </span>

              Dashboard
            </button>

            <button
              type="button"
              className="tf-nav-item"
              onClick={scrollToMyTasks}
            >
              <span className="tf-nav-icon">
                ✓
              </span>

              My Tasks
            </button>

          </nav>

        </div>

        {/* User Profile */}

        <div
          className="tf-sidebar-user-area"
          ref={profileRef}
        >

          <button
            type="button"
            className="tf-sidebar-user"
            onClick={() =>
              setProfileMenuOpen(
                !profileMenuOpen
              )
            }
          >

            <div className="tf-avatar">
              {userInitial}
            </div>

            <div className="tf-user-details">

              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.email || ""}
              </span>

            </div>

            <span className="tf-profile-arrow">
              {profileMenuOpen ? "⌃" : "⌄"}
            </span>

          </button>

          {profileMenuOpen && (
            <div className="tf-account-menu">

              <div className="tf-account-header">

                <div className="tf-account-avatar">
                  {userInitial}
                </div>

                <div>
                  <strong>
                    {user?.name || "User"}
                  </strong>

                  <span>
                    {user?.email || ""}
                  </span>
                </div>

              </div>

              <div className="tf-account-divider"></div>

              <button
                type="button"
                className="tf-account-item"
                onClick={handleSwitchAccount}
              >

                <span className="tf-account-item-icon">
                  ⇄
                </span>

                <div>
                  <strong>
                    Switch account
                  </strong>

                  <small>
                    Login with another account
                  </small>
                </div>

              </button>

              <button
                type="button"
                className="tf-account-item tf-logout-item"
                onClick={handleLogout}
              >

                <span className="tf-account-item-icon">
                  ↪
                </span>

                <div>
                  <strong>
                    Logout
                  </strong>

                  <small>
                    Sign out of TaskFlow
                  </small>
                </div>

              </button>

            </div>
          )}

        </div>

      </aside>

      {/* =========================
          MAIN
      ========================== */}

      <main className="tf-main">

        <div className="tf-container">

          {/* TOP BAR */}

          <header className="tf-topbar">

            <div>

              <span className="tf-page-label">
                WORKSPACE
              </span>

              <h1>
                Dashboard
              </h1>

              <p>
                Manage your productivity and stay
                on top of your work.
              </p>

            </div>

            {/*
              Top-right Add Task button
              and top-right V avatar
              intentionally removed.
            */}

          </header>

          {/* WELCOME */}

          <section className="tf-welcome">

            <h2>
              Good to see you,{" "}
              {user?.name || "there"} 👋
            </h2>

            <p>
              Here's what's happening with your
              tasks today.
            </p>

          </section>

          {/* =========================
              STATISTICS
          ========================== */}

          <section className="tf-stats-grid">

            <div className="tf-stat-card">

              <div className="tf-stat-icon tf-blue">
                ✓
              </div>

              <div className="tf-stat-content">

                <span>
                  Total Tasks
                </span>

                <strong>
                  {totalTodos}
                </strong>

                <small>
                  All your tasks
                </small>

              </div>

            </div>

            <div className="tf-stat-card">

              <div className="tf-stat-icon tf-green">
                ✓
              </div>

              <div className="tf-stat-content">

                <span>
                  Completed
                </span>

                <strong>
                  {completedTodos}
                </strong>

                <small>
                  Tasks finished
                </small>

              </div>

            </div>

            <div className="tf-stat-card">

              <div className="tf-stat-icon tf-yellow">
                ◷
              </div>

              <div className="tf-stat-content">

                <span>
                  Pending
                </span>

                <strong>
                  {pendingTodos}
                </strong>

                <small>
                  Still to do
                </small>

              </div>

            </div>

            <div className="tf-stat-card">

              <div className="tf-stat-icon tf-red">
                !
              </div>

              <div className="tf-stat-content">

                <span>
                  Overdue
                </span>

                <strong>
                  {overdueTodos}
                </strong>

                <small>
                  Needs attention
                </small>

              </div>

            </div>

          </section>

          {/* =========================
              QUICK STATS
          ========================== */}

          <section className="tf-quick-grid">

            <div className="tf-quick-card">

              <span className="tf-dot tf-dot-red"></span>

              <div>
                <strong>
                  {highPriorityTodos}
                </strong>

                <span>
                  High Priority
                </span>
              </div>

            </div>

            <div className="tf-quick-card">

              <span className="tf-dot tf-dot-orange"></span>

              <div>
                <strong>
                  {overdueTodos}
                </strong>

                <span>
                  Overdue
                </span>
              </div>

            </div>

            <div className="tf-quick-card">

              <span className="tf-dot tf-dot-blue"></span>

              <div>
                <strong>
                  {dueTodayTodos}
                </strong>

                <span>
                  Due Today
                </span>
              </div>

            </div>

          </section>

          {/* =========================
              CREATE / EDIT TASK
          ========================== */}

          <section
            className="tf-section-card"
            id="create-task"
          >

            <div className="tf-section-heading">

              <span className="tf-section-eyebrow">
                {editingId
                  ? "UPDATE TASK"
                  : "NEW TASK"}
              </span>

              <h2>
                {editingId
                  ? "Edit your task"
                  : "Create a new task"}
              </h2>

              <p>
                Add details to keep your work
                organized.
              </p>

            </div>

            <form
              className="tf-task-form"
              onSubmit={
                editingId
                  ? handleUpdateTodo
                  : handleCreateTodo
              }
            >

              <div className="tf-form-group tf-task-name">

                <label>
                  Task name
                </label>

                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                />

              </div>

              <div className="tf-form-group">

                <label>
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value)
                  }
                >

                  <option value="High">
                    High
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Low">
                    Low
                  </option>

                </select>

              </div>

              <div className="tf-form-group">

                <label>
                  Deadline
                </label>

                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) =>
                    setDeadline(e.target.value)
                  }
                />

              </div>

              <div className="tf-form-group">

                <label>
                  Reminder
                </label>

                <input
                  type="datetime-local"
                  value={reminder}
                  onChange={(e) =>
                    setReminder(e.target.value)
                  }
                />

              </div>

              <div className="tf-form-actions">

                <button
                  type="submit"
                  className="tf-primary-button"
                >
                  {editingId
                    ? "Update Task"
                    : "Add Task"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="tf-secondary-button"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>

          </section>

          {/* =========================
              MY TASKS
          ========================== */}

          <section
            className="tf-tasks-section"
            id="my-tasks-section"
          >

            <div className="tf-tasks-header">

              <div>

                <span className="tf-section-eyebrow">
                  YOUR WORK
                </span>

                <h2>
                  My Tasks
                </h2>

                <p>
                  Manage and track your tasks.
                </p>

              </div>

              <span className="tf-task-count">
                {filteredTodos.length} tasks
              </span>

            </div>

            {/* Search */}

            <div className="tf-search">

              <span className="tf-search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search your tasks..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  className="tf-clear-search"
                  onClick={() =>
                    setSearchTerm("")
                  }
                >
                  ×
                </button>
              )}

            </div>

            {/* Filters */}

            <div className="tf-filters">

              <div className="tf-filter-group">

                <span>
                  Status
                </span>

                <div className="tf-filter-buttons">

                  {[
                    "All",
                    "Active",
                    "Completed",
                    "Overdue",
                  ].map((filter) => (

                    <button
                      type="button"
                      key={filter}
                      className={
                        statusFilter === filter
                          ? "tf-filter-button tf-filter-active"
                          : "tf-filter-button"
                      }
                      onClick={() =>
                        setStatusFilter(filter)
                      }
                    >
                      {filter}
                    </button>

                  ))}

                </div>

              </div>

              <div className="tf-filter-group">

                <span>
                  Priority
                </span>

                <div className="tf-filter-buttons">

                  {[
                    "All",
                    "High",
                    "Medium",
                    "Low",
                  ].map((filter) => (

                    <button
                      type="button"
                      key={filter}
                      className={
                        priorityFilter === filter
                          ? "tf-filter-button tf-filter-active"
                          : "tf-filter-button"
                      }
                      onClick={() =>
                        setPriorityFilter(filter)
                      }
                    >
                      {filter}
                    </button>

                  ))}

                </div>

              </div>

            </div>

            {/* =========================
                TASK LIST
            ========================== */}

            {loading ? (

              <div className="tf-empty-state">

                <div className="tf-loading-spinner"></div>

                <p>
                  Loading your tasks...
                </p>

              </div>

            ) : filteredTodos.length === 0 ? (

              <div className="tf-empty-state">

                <div className="tf-empty-icon">
                  ✓
                </div>

                <h3>
                  No tasks found
                </h3>

                <p>
                  Try changing your search or
                  filters.
                </p>

              </div>

            ) : (

              <div className="tf-todo-list">

                {filteredTodos.map((todo) => (

                  <article
                    key={todo._id}
                    className={
                      todo.completed
                        ? "tf-todo-card tf-completed"
                        : isOverdue(todo)
                        ? "tf-todo-card tf-overdue"
                        : "tf-todo-card"
                    }
                  >

                    <div className="tf-todo-main">

                      <button
                        type="button"
                        className={
                          todo.completed
                            ? "tf-complete-circle tf-checked"
                            : "tf-complete-circle"
                        }
                        onClick={() =>
                          handleToggleTodo(todo)
                        }
                      >
                        {todo.completed ? "✓" : ""}
                      </button>

                      <div className="tf-todo-content">

                        <div className="tf-todo-title-row">

                          <h3>
                            {todo.title}
                          </h3>

                          <span
                            className={`tf-priority-badge ${
                              todo.priority
                                ? todo.priority.toLowerCase()
                                : "medium"
                            }`}
                          >
                            {todo.priority}
                          </span>

                        </div>

                        <div className="tf-todo-meta">

                          <span>
                            ◷{" "}
                            {todo.deadline
                              ? formatDateTime(
                                  todo.deadline
                                )
                              : "No deadline"}
                          </span>

                          <span>
                            🔔{" "}
                            {todo.reminder
                              ? formatDateTime(
                                  todo.reminder
                                )
                              : "No reminder"}
                          </span>

                          {isOverdue(todo) && (
                            <span className="tf-overdue-label">
                              ● Overdue
                            </span>
                          )}

                          {isDueToday(todo) &&
                            !isOverdue(todo) && (
                              <span className="tf-today-label">
                                ● Due today
                              </span>
                            )}

                        </div>

                      </div>

                    </div>

                    <div className="tf-todo-actions">

                      <button
                        type="button"
                        className="tf-action tf-complete-action"
                        onClick={() =>
                          handleToggleTodo(todo)
                        }
                      >
                        {todo.completed
                          ? "Undo"
                          : "Complete"}
                      </button>

                      <button
                        type="button"
                        className="tf-action"
                        onClick={() =>
                          handleEditTodo(todo)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="tf-action tf-delete-action"
                        onClick={() =>
                          handleDeleteTodo(todo._id)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </article>

                ))}

              </div>

            )}

          </section>

          {/* FOOTER */}

          <footer className="tf-footer">

            <span>
              TaskFlow
            </span>

            <span>
              Stay focused. Get things done.
            </span>

          </footer>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;