import React from 'react';
import HeartIcon from './HeartIcon.jsx';
import CalendarIcon from './CalendarIcon.jsx';
import MailIcon from './MailIcon.jsx';
import ComplaintIcon from './ComplaintIcon.jsx';
import HomeIcon from './HomeIcon.jsx';
import ImageIcon from './ImageIcon.jsx';
import PlusIcon from './PlusIcon.jsx';
import EditIcon from './EditIcon.jsx';
import TrashIcon from './TrashIcon.jsx';
import LockIcon from './LockIcon.jsx';
import ClockIcon from './ClockIcon.jsx';
import SendIcon from './SendIcon.jsx';
import CheckIcon from './CheckIcon.jsx';
import CloseIcon from './CloseIcon.jsx';
import ChevronLeftIcon from './ChevronLeftIcon.jsx';
import ChevronRightIcon from './ChevronRightIcon.jsx';
import ChevronDownIcon from './ChevronDownIcon.jsx';
import SearchIcon from './SearchIcon.jsx';
import FilterIcon from './FilterIcon.jsx';
import UserIcon from './UserIcon.jsx';
import LogOutIcon from './LogOutIcon.jsx';
import MenuIcon from './MenuIcon.jsx';
import WarningIcon from './WarningIcon.jsx';
import InfoIcon from './InfoIcon.jsx';
import GiftIcon from './GiftIcon.jsx';
import StarIcon from './StarIcon.jsx';
import LocationPinIcon from './LocationPinIcon.jsx';
import SunIcon from './SunIcon.jsx';
import MoonIcon from './MoonIcon.jsx';
import MessageCircleIcon from './MessageCircleIcon.jsx';
import ArrowRightIcon from './ArrowRightIcon.jsx';

const ICON_MAP = {
  heart: HeartIcon,
  calendar: CalendarIcon,
  mail: MailIcon,
  complaint: ComplaintIcon,
  home: HomeIcon,
  image: ImageIcon,
  plus: PlusIcon,
  edit: EditIcon,
  trash: TrashIcon,
  lock: LockIcon,
  clock: ClockIcon,
  send: SendIcon,
  check: CheckIcon,
  close: CloseIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-down': ChevronDownIcon,
  search: SearchIcon,
  filter: FilterIcon,
  user: UserIcon,
  logout: LogOutIcon,
  menu: MenuIcon,
  warning: WarningIcon,
  info: InfoIcon,
  gift: GiftIcon,
  star: StarIcon,
  location: LocationPinIcon,
  sun: SunIcon,
  moon: MoonIcon,
  message: MessageCircleIcon,
  'arrow-right': ArrowRightIcon,
};

/**
 * Generic Icon component mapping name string to SVG component
 */
export const Icon = ({ name, ...props }) => {
  const Component = ICON_MAP[name] || HeartIcon;
  return <Component {...props} />;
};

export default Icon;
