export default function getTimeOfDayTheme() {
    const hour = new Date().getHours();
    if (hour > 10 && hour < 17) return 'day';
    if(hour > 21 || hour < 6) return 'night';
    return 'dawndusk';
}