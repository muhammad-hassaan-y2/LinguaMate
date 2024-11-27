'use client';

import { useRouter } from 'next/navigation';

import { MoreHorizontalIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { BetterTooltip } from '@/components/ui/tooltip';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
export function NewAppSidebar({chats, createNewChat, activeChat}:any) {
  const router = useRouter();
  const {open, setOpen, setOpenMobile } = useSidebar();


  return (
    <Sidebar  className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row pt-3 justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Chatbot
              </span>
            </Link>
            <BetterTooltip content="New Chat" align="start">
              <Button
                variant="ghost"
                type="button"
                className="p-2 h-fit"
                onClick={() => {
                  createNewChat()
                }}
              >
                <PlusIcon />
              </Button>
            </BetterTooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="-mx-2">
        <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
          {
            chats.map((chat:any,i:any)=><ChatItem key={i} chat={chat} isActive={chat.id===activeChat.id} onDelete={()=>{}} setOpenMobile={setOpenMobile} />)
          }
          </SidebarMenu>
          </SidebarGroupContent>
          </SidebarGroup>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const ChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: any;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => (
  <SidebarMenuItem key={chat.id}>
    <SidebarMenuButton asChild isActive={isActive}>
      <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
        <span>{chat.id}</span>
      </Link>
    </SidebarMenuButton>
    <DropdownMenu modal={true}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
          showOnHover={!isActive}
        >
          <MoreHorizontalIcon />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
          onSelect={() => onDelete(chat.id)}
        >
          <TrashIcon />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </SidebarMenuItem>
);