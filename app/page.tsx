"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";

type Character = {
  id: number;
  name: string;
  description: string;
  personality: string;
};

type CharacterFormData = Omit<Character, 'id'>;

const DEFAULT_FORM_DATA: CharacterFormData = {
  name: "",
  description: "",
  personality: "",
};

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [idCounter, setIdCounter] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState<CharacterFormData>(DEFAULT_FORM_DATA);
  const [error, setError] = useState<string | null>(null);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize useChat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    onFinish: (message) => {
      console.log('Chat finished with message:', message);
      setGeneratedStory(message.content);
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setError("Failed to generate story");
      setIsGenerating(false);
    }
  });

  // Load characters from localStorage on mount
  useEffect(() => {
    try {
      const storedCharacters = localStorage.getItem("characters");
      if (storedCharacters) {
        setCharacters(JSON.parse(storedCharacters));
      }
    } catch (err) {
      setError("Failed to load characters from storage");
      console.error("Error loading characters:", err);
    }
  }, []);

  // Save characters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("characters", JSON.stringify(characters));
    } catch (err) {
      setError("Failed to save characters to storage");
      console.error("Error saving characters:", err);
    }
  }, [characters]);

  const openModal = (character?: Character) => {
    if (character) {
      setEditingCharacter(character);
      setFormData({
        name: character.name,
        description: character.description,
        personality: character.personality,
      });
    } else {
      setEditingCharacter(null);
      setFormData(DEFAULT_FORM_DATA);
    }
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCharacter(null);
    setFormData(DEFAULT_FORM_DATA);
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.personality.trim()) {
      setError("Personality is required");
      return false;
    }
    return true;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCharacter) {
      setCharacters((prev) =>
        prev.map((char) =>
          char.id === editingCharacter.id
            ? { ...char, ...formData }
            : char
        )
      );
    } else {
      setCharacters((prev) => [
        ...prev,
        {
          id: idCounter,
          ...formData,
        },
      ]);
      setIdCounter((prev) => prev + 1);
    }
    closeModal();
  };

  const deleteCharacter = (id: number) => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      setCharacters((prev) => prev.filter((char) => char.id !== id));
    }
  };

  const generateStory = async () => {
    if (characters.length === 0) {
      setError("Please add at least one character before generating a story");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Create a prompt using character data
      const characterDescriptions = characters
        .map(char => `${char.name}: ${char.description} (${char.personality})`)
        .join("\n");

      const prompt = `Create a story using these characters:\n${characterDescriptions}`;
      
      console.log('Sending prompt to API:', prompt);
      
      // Create a form event with the prompt
      const formEvent = new Event('submit') as any;
      formEvent.preventDefault = () => {};
      
      // Set the input value before submitting
      const inputEvent = new Event('input') as any;
      inputEvent.target = { value: prompt };
      handleInputChange(inputEvent);
      
      // Submit the form
      await handleSubmit(formEvent);
    } catch (err) {
      console.error('Error in generateStory:', err);
      setError(err instanceof Error ? err.message : "Failed to generate story");
      setIsGenerating(false);
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Story Character Manager</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex gap-4 mb-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          onClick={() => openModal()}
        >
          Add Character
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={generateStory}
          disabled={isGenerating || characters.length === 0}
        >
          {isGenerating ? "Generating Story..." : "Generate Story"}
        </button>
      </div>

      {/* Character List */}
      <div className="grid gap-4 md:grid-cols-2">
        {characters.map((char) => (
          <div
            key={char.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{char.name}</h3>
              <div className="flex gap-2">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors"
                  onClick={() => openModal(char)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                  onClick={() => deleteCharacter(char.id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-2">{char.description}</p>
            <p className="text-gray-500 mb-2">Personality: {char.personality}</p>
          </div>
        ))}
      </div>

      {/* Generated Story */}
      {generatedStory && (
        <div className="mt-8 p-6 border rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Generated Story</h2>
          <p className="whitespace-pre-wrap text-gray-700">{generatedStory}</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {editingCharacter ? "Edit Character" : "Add New Character"}
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Personality
                </label>
                <textarea
                  value={formData.personality}
                  onChange={(e) =>
                    setFormData({ ...formData, personality: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {editingCharacter ? "Save Changes" : "Add Character"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
