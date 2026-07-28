export type ItemDetailResponse = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  itemType: { name: string; icon: string; color: string };
  collections: { id: string; name: string }[];
};

export type DrawerFormData = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
};
