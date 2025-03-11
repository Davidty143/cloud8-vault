// HeaderDropDownMenu.tsx

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiArrowDropDownFill } from "react-icons/ri";
import Link from "next/link";

// Define types for the menu items
interface DropdownMenuProps {
  menuItems: { text: string; href: string }[]; // Array of objects with text and href
  triggerText: string; // Text for the dropdown trigger (this is used as the title)
  triggerLink: string; // Link for the title (e.g., "/home")
  dropdownPosition?: string; // Custom position as a string
}

const HeaderDropdownMenu = ({
  menuItems,
  triggerText,
  triggerLink,
  dropdownPosition = "left", // Default position is left
}: DropdownMenuProps) => {
  // We will apply the custom position class if it exists
  const positionClass = dropdownPosition ? dropdownPosition : "left-0";

  return (
    <DropdownMenu>
      {/* Link for the main trigger to navigate to its page */}
      <Link
        href={triggerLink}
        className="bg-gray-600 p-3 rounded flex items-center cursor-pointer relative"
      >
        {/* Dropdown trigger (icon and title) */}
        <span className="text-white">{triggerText}</span>
        <DropdownMenuTrigger>
          <RiArrowDropDownFill className="ml-2 text-2xl text-white" />
        </DropdownMenuTrigger>
      </Link>

      {/* Dropdown menu content */}
      <DropdownMenuContent
        className={`absolute mt-2 w-auto ${positionClass} transform`} // Apply custom position
      >
        {menuItems.map((item, index) => (
          <DropdownMenuItem key={index}>
            {/* Link each item to its specified href */}
            <Link href={item.href}>{item.text}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderDropdownMenu;
