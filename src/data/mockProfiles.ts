export interface Profile {
  id: string;
  uid?: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
  location: string;
  occupation: string;
  interests: string[];
  createdAt?: string;
}

export const mockProfiles: Profile[] = [
  {
    id: "1",
    name: "Елена",
    age: 26,
    bio: "Архитектор и ценитель искусства. Верю, что красота кроется в деталях. Ищу того, кто ценит прекрасное в жизни.",
    images: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800"
    ],
    location: "Монако",
    occupation: "Архитектор",
    interests: ["Искусство", "Путешествия", "Дизайн", "Вино"]
  },
  {
    id: "2",
    name: "Александр",
    age: 31,
    bio: "Предприниматель, пилот и любитель вина. Жизнь — это приключение, и я ищу второго пилота.",
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800"
    ],
    location: "Цюрих",
    occupation: "Основатель IT-компании",
    interests: ["Авиация", "Парусный спорт", "Бизнес", "Фитнес"]
  },
  {
    id: "3",
    name: "София",
    age: 24,
    bio: "Дизайнер одежды из Милана. Всегда ищу вдохновение на улицах и в галереях.",
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800"
    ],
    location: "Милан",
    occupation: "Дизайнер моды",
    interests: ["Мода", "Фотография", "Опера", "Йога"]
  },
  {
    id: "4",
    name: "Юлиан",
    age: 29,
    bio: "Шеф-повар. Выражаю свою страсть через вкусы. Давайте разделим трапезу и историю.",
    images: [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=800"
    ],
    location: "Париж",
    occupation: "Шеф-повар",
    interests: ["Гастрономия", "Музыка", "Походы", "Литература"]
  }
];
