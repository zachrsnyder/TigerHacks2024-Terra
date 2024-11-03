export default function getTimeOfDayTheme() {
    //test day
    // return 'day'
    const hour = new Date().getHours();
    if (hour > 6 && hour < 17) return 'day';
    return 'night';
}