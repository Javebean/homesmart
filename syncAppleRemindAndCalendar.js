var dur_month = 1;

const startDate = new Date();
startDate.setMonth(startDate.getMonth() - dur_month);
console.log(`日历的开始时间 ${startDate.toLocaleDateString()}`);

const endDate = new Date();
endDate.setMonth(endDate.getMonth() + dur_month);
console.log(`日历的结束时间 ${endDate.toLocaleDateString()}`);

//没有日期的提醒，查询不到：因为一个正确的提醒必须要有日期，没有日期的严格意义上属于不正常
const reminders = await Reminder.allDueBetween(startDate, endDate);
console.log(`获取 ${reminders.length} 条提醒事项`);

var calendar = await Calendar.forEvents();

//获取日历名和对应的日历
var m_dict = {};
for (cal of calendar) {
  m_dict[cal.title] = cal;
  //console.log(`日历:${cal.title}`)
}

const events = await CalendarEvent.between(startDate, endDate, calendar);
console.log(`获取 ${events.length} 条日历`);

var reminders_id_set = new Set(reminders.map((e) => e.identifier));
//删除日历里提醒事项删除的事项
events_created = events.filter(
  (e) => e.notes != null && e.notes.includes("[Reminder]")
);
for (let event of events_created) {
  //console.warn(event.notes)
  let reg = /(\[Reminder\])\s([A-Z0-9\-]*)/;
  let r = event.notes.match(reg);
  //if(r) console.log(r[2])
  if (!reminders_id_set.has(r[2])) {
    event.remove();
  }
}

for (const reminder of reminders) {
  //reminder的标识符
  const targetNote = `[Reminder] ${reminder.identifier}`;
  const [targetEvent] = events.filter(
    (e) => e.notes != null && e.notes.includes(targetNote)
  ); //过滤重复的reminder
  if (!m_dict[reminder.calendar.title]) {
    console.warn("找不到日历" + reminder.calendar.title);
    continue;
  }
  if (targetEvent) {
    console.log(`找到已经创建的事项 ${reminder.title}`);
    updateEvent(targetEvent, reminder);
  } else {
    console.warn(`创建事项 ${reminder.title} 到 ${reminder.calendar.title}`);
    const newEvent = new CalendarEvent();
    newEvent.notes = targetNote + "\n" + (reminder.notes ? reminder.notes : ""); //要加入备注
    updateEvent(newEvent, reminder);
  }
}

Script.complete();

function updateEvent(event, reminder) {
  var now = new Date();
  event.title = `${reminder.title}`;
  cal_name = reminder.calendar.title;
  cal = m_dict[cal_name];
  event.calendar = cal;
  //console.warn(event.calendar.title)

  //让日历中的开始时间和提醒日相同天
  // if (!reminder.dueDateIncludesTime) {
  event.startDate = reminder.dueDate;
  event.endDate = reminder.dueDate;
  // } else {
  //   event.startDate = addHours(new Date(), 1);
  //   event.endDate = setToMidnight(reminder.dueDate);
  // }
  event.isAllDay = true; //这个应该会把start endDate强制改成00:00 - 23:59

  var period = (setToMidnight(reminder.dueDate) - now) / 1000 / 3600 / 24;

  if (reminder.isCompleted) {
    event.title = "✅" + getCalendarTitle(reminder);
    // event.title = '😃'+getCalendarTitle(reminder);
    event.location = "实际完成日期：" + formatDate(reminder.completionDate);
  } else {
    //未完成事项
    if (period < 0) {
      //超过一天没完成
      event.title = "❌" + getCalendarTitle(reminder) + "【已超期】";
      event.endDate = now; //超期的把endDate一直顺延，加强提醒
      event.location = "开始日期：" + shortDate(reminder.dueDate);
    } else {
      //当天或未来还没完成
      event.title = "⭕️" + getCalendarTitle(reminder);
      // event.title = '🔴'+getCalendarTitle(reminder);
    }
  }

  console.log(event.title + "-" + event.startDate + "  " + event.endDate);
  event.save();
}

function getCalendarTitle(reminder) {
  if (reminder.dueDateIncludesTime) {
    return reminder.title + " (" + shortTime(reminder.dueDate) + ")";
  } else {
    return reminder.title;
  }
}

function formatDate(date) {
  var month = date.getMonth() + 1,
    day = date.getDate(),
    year = date.getFullYear(),
    hours = date.getHours(),
    minutes = date.getMinutes();

  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;

  return year + "/" + month + "/" + day + " " + hours + ":" + minutes;
}

function shortDate(date) {
  var month = date.getMonth() + 1,
    day = date.getDate(),
    year = date.getFullYear();

  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;

  return year + "/" + month + "/" + day;
}

function shortTime(date) {
  var hours = date.getHours(),
    minutes = date.getMinutes();
  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;

  return hours + ":" + minutes;
}

function setToMidnight(date) {
  // 将时间设置为当天的23点59分59秒
  date.setHours(23);
  date.setMinutes(59);
  date.setSeconds(59);

  return date;
}

function addHours(date, h) {
  date.setHours(date.getHours() + h);
  return date;
}
