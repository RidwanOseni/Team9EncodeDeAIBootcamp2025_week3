'use client';
import { useEffect, useState } from 'react'; import { useRouter } from 'next/navigation';
interface Character { id: number; name: string; description: string; personality: string }
export default function CharactersPage() { const [chars, setChars] = useState<Character[]>([]); const router = useRouter(); useEffect(() => { fetch('/api/characters').then(r => r.json()).then(setChars); }, []);
return (<div><h1 className="text-2xl mb-4">Characters</h1><button onClick={() => router.push('/characters/create')} className="btn">New Character</button><ul className="mt-4 space-y-2">{chars.map(c => (<li key={c.id} className="flex justify-between"><span>{c.name}</span><div><button onClick={() => router.push(`/characters/${c.id}/edit`)} className="btn mr-2">Edit</button><button onClick={async () => { await fetch(`/api/characters/${c.id}`, { method: 'DELETE' }); setChars(chars.filter(x => x.id !== c.id)); }} className="btn">Delete</button></div></li>))}</ul></div>);
}