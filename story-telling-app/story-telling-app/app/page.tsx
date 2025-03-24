'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';

type Character = {
  id: number;
  name: string;
  description: string;
  personality: string;
};

export default function Chat() {
  const { messages, append, isLoading } = useChat();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [editingCharacterId, setEditingCharacterId] = useState<number | null>(
    null
  );
  const [view, setView] = useState<'add' | 'story'>('story');
  const genres = [
    { emoji: '🧙', value: 'Fantasy' },
    { emoji: '🕵️', value: 'Mystery' },
    { emoji: '💑', value: 'Romance' },
    { emoji: '🚀', value: 'Sci-Fi' },
  ];

  const tones = [
    { emoji: '😊', value: 'Happy' },
    { emoji: '😢', value: 'Sad' },
    { emoji: '😏', value: 'Sarcastic' },
    { emoji: '😂', value: 'Funny' },
  ];

  const [state, setState] = useState({
    genre: '',
    tone: '',
  });

  const handleChange = ({ target: { name, value } }) => {
    setState({
      ...state,
      [name]: value,
    });
  };

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const handleAddOrEditCharacter = () => {
    if (editingCharacterId !== null) {
      setCharacters((prev) =>
        prev.map((character) =>
          character.id === editingCharacterId
            ? { id: character.id, name, description, personality }
            : character
        )
      );
      setEditingCharacterId(null);
    } else {
      setCharacters((prev) => [
        ...prev,
        { id: Date.now(), name, description, personality },
      ]);
    }
    setName('');
    setDescription('');
    setPersonality('');
    setView('story');
  };

  const handleAddCharacter = () => {
    setEditingCharacterId(null);
    setName('');
    setDescription('');
    setPersonality('');
    setView('add');
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacterId(character.id);
    setName(character.name);
    setDescription(character.description);
    setPersonality(character.personality);
    setView('add');
  };

  const handleDeleteCharacter = (id: number) => {
    setCharacters((prev) => prev.filter((character) => character.id !== id));
  };

  const handleGenerate = async () => {
    const charactersPrompt = characters.length
      ? `Characters: \n${characters
          .map(
            (character) =>
              `- Name: ${character.name}, Description: ${character.description}, Personality: ${character.personality}`
          )
          .join('\n')}\n`
      : '';

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `${charactersPrompt}This is a ${state.genre} story in a ${state.tone} tone.`,
          },
        ],
      }),
    });

    if (response.ok) {
      const result = await response.json();
      append({
        role: 'assistant',
        content: result.assistantMessage,
      });
    } else {
      console.error('Error generating story:', response.statusText);
    }
  };

  return (
    <main className='mx-auto w-full p-24 flex flex-col'>
      <div className='p4 m-4'>
        <div className='space-y-8 text-white'>
          <h2 className='text-3xl font-bold'>Story Telling App</h2>
          <p className='text-zinc-500 dark:text-zinc-400'>
            Customize the story by selecting the genre and tone.
          </p>

          <div className='flex justify-between gap-4'>
            <h3 className='text-xl font-semibold'>Manage Characters</h3>
            {view == 'add' ? (
              <button
                onClick={() => {
                  setEditingCharacterId(null);
                  setView('story');
                }}
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50'
              >
                Back
              </button>
            ) : (
              <button
                onClick={handleAddCharacter}
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50'
              >
                Add Character
              </button>
            )}
          </div>
          {view == 'add' ? (
            <div className='max-w-xl mx-auto p-6 space-y-6 text-black'>
              <h1 className='text-xl font-bold'>Add Character </h1>
              <input
                className='w-full p-2 border'
                placeholder='Name'
                value={name}
                onChange={handleInputChange(setName)}
              />
              <textarea
                className='w-full p-2 border'
                placeholder='Description'
                value={description}
                onChange={handleInputChange(setDescription)}
              />
              <input
                className='w-full p-2 border'
                placeholder='Personality'
                value={personality}
                onChange={handleInputChange(setPersonality)}
              />
              <button
                onClick={handleAddOrEditCharacter}
                className='bg-blue-600 text-white px-4 py-2 rounded'
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className='space-y-8 text-white'>
              {' '}
              <h4>Character List</h4>
              <ul>
                {characters.map((character) => (
                  <li
                    key={character.id}
                    className='flex justify-between bg-gray-600 p-2 rounded mb-2'
                  >
                    <div>
                      <strong>{character.name}</strong> -{' '}
                      {character.description} (Personality:{' '}
                      {character.personality})
                    </div>
                    <div>
                      <button
                        className=' ml-2 text-yellow-400'
                        onClick={() => handleEditCharacter(character)}
                      >
                        Edit
                      </button>
                      <button
                        className='ml-2 text-red-500'
                        onClick={() => handleDeleteCharacter(character.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className='space-y-4 bg-opacity-25 bg-gray-700 rounded-lg p-4'>
                <h3 className='text-xl font-semibold'>Genre</h3>
                <div className='flex flex-wrap justify-center'>
                  {genres.map(({ value, emoji }) => (
                    <div
                      key={value}
                      className='p-4 m-2 bg-opacity-25 bg-gray-600 rounded-lg'
                    >
                      <input
                        id={value}
                        type='radio'
                        value={value}
                        name='genre'
                        onChange={handleChange}
                      />
                      <label
                        className='ml-2'
                        htmlFor={value}
                      >{`${emoji} ${value}`}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className='space-y-4 bg-opacity-25 bg-gray-700 rounded-lg p-4'>
                <h3 className='text-xl font-semibold'>Tones</h3>
                <div className='flex flex-wrap justify-center'>
                  {tones.map(({ value, emoji }) => (
                    <div
                      key={value}
                      className='p-4 m-2 bg-opacity-25 bg-gray-600 rounded-lg'
                    >
                      <input
                        id={value}
                        type='radio'
                        name='tone'
                        value={value}
                        onChange={handleChange}
                      />
                      <label
                        className='ml-2'
                        htmlFor={value}
                      >{`${emoji} ${value}`}</label>
                    </div>
                  ))}
                </div>
              </div>
              <button
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50'
                disabled={isLoading || !state.genre || !state.tone}
                onClick={handleGenerate}
              >
                Generate Story
              </button>
              <div>
                <h3>Character Summaries</h3>
                {characters.map((character) => (
                  <div key={character.id}>
                    <strong>{character.name}</strong>: This character is
                    described as {character.description} and has a personality
                    of {character.personality}.
                  </div>
                ))}
              </div>
              <div
                hidden={
                  messages.length === 0 ||
                  messages[messages.length - 1]?.content.startsWith('Generate')
                }
                className='bg-opacity-25 bg-gray-700 rounded-lg p-4'
              >
                {messages[messages.length - 1]?.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
