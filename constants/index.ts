import { Description } from "@radix-ui/react-dialog"
import { title } from "process"

export const headerLinks = [
    {
        label:"Home",
        route:"/"
    },
    {
        label:"Create Event",
        route:"/events/create"
    },
    {
        label:"My Profile",
        route:"/profile"
    }
]

export const eventDefaultValues = {
    title:'',
    description:'',
    location:'',
    imageUrl:'',
    startDateTime:'',
    endDateTime:'',
    categoryId:'',
    price:'',
    isFree:'',
    url:''    
}
