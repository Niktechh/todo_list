"use client";

import React, { useState, useEffect } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { CiFlag1 } from "react-icons/ci";
import { FiSidebar } from "react-icons/fi";
import { BsCheckLg } from "react-icons/bs";
import { BiCategory } from "react-icons/bi";
import confetti from "canvas-confetti";

interface TodoItem {
  title: string;
  description: string;
  category: "Work" | "Personal" | "School";
  priority: "Low" | "Medium" | "High";
  completedOn?: string;
}

const TodoPage: React.FC = () => {
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [allTodos, setTodos] = useState<TodoItem[]>([]);
  const [completedTodos, setCompletedTodos] = useState<TodoItem[]>([]);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<"" | "Work" | "Personal" | "School">("");
  const [newPriority, setNewPriority] = useState<"" | "Low" | "Medium" | "High">("");

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  // Load from localStorage
  useEffect(() => {
    const savedTodo = JSON.parse(localStorage.getItem("todolist") || "[]");
    const savedCompleted = JSON.parse(localStorage.getItem("completedTodos") || "[]");
    setTodos(savedTodo);
    setCompletedTodos(savedCompleted);
  }, []);

  // Save to localStorage
  const saveTodos = (updated: TodoItem[]) => {
    setTodos(updated);
    localStorage.setItem("todolist", JSON.stringify(updated));
  };

  // Add / Update task
  const handleAddOrUpdateTodo = () => {
    if (!newTitle.trim() || !newDescription.trim() || !newCategory || !newPriority) return;

    if (editIndex !== null) {
      const updated = [...allTodos];
      updated[editIndex] = {
        title: newTitle,
        description: newDescription,
        category: newCategory as TodoItem["category"],
        priority: newPriority as TodoItem["priority"],
      };
      saveTodos(updated);
      setEditIndex(null);
    } else {
      const newTodo: TodoItem = {
        title: newTitle,
        description: newDescription,
        category: newCategory as TodoItem["category"],
        priority: newPriority as TodoItem["priority"],
      };
      const updatedTodos = [...allTodos, newTodo];
      saveTodos(updatedTodos);
    }

    setNewTitle("");
    setNewDescription("");
    setNewCategory("");
    setNewPriority("");
    setShowAddForm(false);
    setIsCompleteScreen(false);
  };

  // Delete task
  const handleDeleteTodo = (index: number) => {
    const reduced = [...allTodos];
    reduced.splice(index, 1);
    saveTodos(reduced);
  };

  // Mark as Complete with  Confetti
  const handleComplete = (index: number, e?: React.MouseEvent) => {
    const now = new Date();
    const completedOn = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    const completedTask = { ...allTodos[index], completedOn };
    const updatedCompleted = [...completedTodos, completedTask];
    setCompletedTodos(updatedCompleted);
    localStorage.setItem("completedTodos", JSON.stringify(updatedCompleted));
    handleDeleteTodo(index);

    // Confetti sparkle burst on click
    const x = e ? e.clientX / window.innerWidth : 0.5;
    const y = e ? e.clientY / window.innerHeight : 0.5;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      colors: ["#FFD700", "#FF69B4", "#87CEFA", "#B10DC9", "#FF4136"],
    });
  };

  // Delete completed task
  const handleDeleteCompleted = (index: number) => {
    const reduced = [...completedTodos];
    reduced.splice(index, 1);
    setCompletedTodos(reduced);
    localStorage.setItem("completedTodos", JSON.stringify(reduced));
  };

  // Edit existing task
  const handleEditTodo = (index: number) => {
    const item = allTodos[index];
    setNewTitle(item.title);
    setNewDescription(item.description);
    setNewCategory(item.category);
    setNewPriority(item.priority);
    setEditIndex(index);
    setShowAddForm(true);
  };

  // Filtering logic
  const filteredTodos = allTodos.filter((todo) => {
    const categoryMatch = filterCategory === "All" || todo.category === filterCategory;
    const priorityMatch = filterPriority === "All" || todo.priority === filterPriority;
    return categoryMatch && priorityMatch;
  });

  const hasNoTasks = allTodos.length === 0 && completedTodos.length === 0;

  return (
    <div className="flex min-h-screen bg-[#ffffff] text-[#010101] transition-all duration-300">
      {/* Sidebar */}
      <div
        className={`h-screen bg-[#fcfaf8] border-r border-gray-300 flex flex-col justify-between transition-all duration-300 ${
          isSidebarOpen ? "w-64 p-5" : "w-16 p-3"
        }`}
      >
        <div>
          <div className="flex justify-between items-center mb-6">
            {isSidebarOpen && <h2 className="text-lg font-bold">Todo Menu</h2>}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-xl text-gray-600 hover:text-black transition"
            >
              <FiSidebar />
            </button>
          </div>

          <nav className="space-y-3">
            {["All", "Work", "Personal", "School"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setFilterCategory(cat);
                  setShowAddForm(false);
                }}
                className={`w-full text-left px-3 py-2 rounded transition ${
                  filterCategory === cat
                    ? "bg-[#ffefe5] text-[#b13751]"
                    : "hover:bg-gray-200 hover:text-[#b13751]"
                }`}
              >
                {isSidebarOpen ? cat : cat[0]}
              </button>
            ))}
          </nav>
        </div>

        {isSidebarOpen && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-6 bg-[#dc4c3e] text-white px-4 py-2 rounded hover:bg-[#c73d31] w-full transition"
          >
            {editIndex !== null ? "Edit Task" : "+ Add Task"}
          </button>
        )}

        {isSidebarOpen && (
          <div className="text-sm text-gray-400 mt-auto">© 2025 TodoApp</div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 transition-all duration-300">
        {showAddForm ? (
          <div className="rounded-lg p-6 w-full max-w-lg mx-auto bg-[#fcfaf8] shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {editIndex !== null ? "Edit Task" : "Add New Task"}
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task Title"
                className="w-full bg-transparent border border-gray-300 text-black placeholder-gray-400 
                focus:outline-none focus:border-[#dc4c3e] focus:ring-0 rounded p-2"
              />

              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Task Description"
                className="w-full bg-transparent border border-gray-300 text-black placeholder-gray-400 
                focus:outline-none focus:border-[#dc4c3e] focus:ring-0 rounded p-2"
              />

              <div className="flex gap-3">
                <div className="flex items-center gap-1 border border-gray-300 rounded p-2 w-1/2">
                  <BiCategory className="text-gray-500" />
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as TodoItem["category"])
                    }
                    className="w-full bg-transparent text-gray-700 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                  >
                    <option value="" disabled>
                      Choose Category
                    </option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="School">School</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 border border-gray-300 rounded p-2 w-1/2">
                  <CiFlag1 className="text-gray-500" />
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as TodoItem["priority"])
                    }
                    className="w-full bg-transparent text-gray-700 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                  >
                    <option value="" disabled>
                      Choose Priority
                    </option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditIndex(null);
                }}
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrUpdateTodo}
                className="px-4 py-2 rounded bg-[#dc4c3e] text-white hover:bg-[#b9382d]"
              >
                {editIndex !== null ? "Update" : "Add Task"}
              </button>
            </div>
          </div>
        ) : hasNoTasks ? (
          <div className="flex flex-col items-center justify-center h-[80vh] text-center">
            <img
              src="https://todoist.b-cdn.net/assets/images/f6defa2ca953237a.png"
              alt="Todoist illustration"
              width={400}
              height={400}
              className="object-contain mb-6"
            />
            <h1 className="text-2xl font-bold mb-4">Capture now, plan later</h1>
            <p className="text-gray-600 mb-6">
              Inbox is your go-to spot for quick task entry. <br />
              Clear your mind now, organize when you’re ready.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-[#dc4c3e] text-white px-4 py-2 rounded"
            >
              + Add Task
            </button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex gap-3 mt-4 flex-wrap">
              <select
                className="border border-gray-300 p-2 rounded bg-[#fcfaf8] text-gray-700"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="School">School</option>
              </select>

              <select
                className="border border-gray-300 p-2 rounded bg-[#fcfaf8] text-gray-700"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Tabs */}
            <div className="mt-4">
              <button
                className={`px-3 py-1 rounded ${
                  !isCompleteScreen ? "bg-[#dc4c3e] text-white" : "bg-gray-100"
                }`}
                onClick={() => setIsCompleteScreen(false)}
              >
                Todo
              </button>
              <button
                className={`px-3 py-1 rounded ml-2 ${
                  isCompleteScreen ? "bg-[#dc4c3e] text-white" : "bg-gray-100"
                }`}
                onClick={() => setIsCompleteScreen(true)}
              >
                Completed
              </button>
            </div>

            {/* Todo List */}
            <div className="mt-6 space-y-4">
              {!isCompleteScreen &&
                filteredTodos.map((item, index) => (
                  <div
                    key={index}
                    className="group flex justify-between items-start p-5 rounded-2xl bg-[#fcfaf8] border border-gray-200 shadow-sm 
                    hover:shadow-md hover:border-[#dc4c3e]/50 transition-all duration-300"
                  >
                    <div>
                      <h3 className="font-semibold text-lg text-[#242424] mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <BiCategory className="text-gray-400" /> {item.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <CiFlag1 className="text-gray-400" />{" "}
                          <span
                            className={`font-medium ${
                              item.priority === "High"
                                ? "text-red-500"
                                : item.priority === "Medium"
                                ? "text-yellow-500"
                                : "text-green-600"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 text-lg opacity-70 group-hover:opacity-100 transition">
                      <BsCheckLg
                        title="Mark Complete"
                        className="cursor-pointer text-green-600 hover:text-green-700"
                        onClick={(e) => handleComplete(index, e)}
                      />
                      <AiOutlineEdit
                        title="Edit"
                        className="cursor-pointer text-blue-500 hover:text-blue-600"
                        onClick={() => handleEditTodo(index)}
                      />
                      <AiOutlineDelete
                        title="Delete"
                        className="cursor-pointer text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteTodo(index)}
                      />
                    </div>
                  </div>
                ))}

              {isCompleteScreen &&
                completedTodos.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start p-5 rounded-2xl bg-[#f6f6f6] border border-gray-300 shadow-sm"
                  >
                    <div>
                      <h3 className="font-semibold text-lg text-gray-700 line-through">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Completed on: {item.completedOn}
                      </p>
                    </div>
                    <AiOutlineDelete
                      className="text-red-500 cursor-pointer text-xl hover:text-red-600"
                      onClick={() => handleDeleteCompleted(index)}
                    />
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TodoPage;
