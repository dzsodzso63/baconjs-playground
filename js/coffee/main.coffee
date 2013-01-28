$ =>

  FlashMessage.target($("#flash"))
  zebra = new Zebra("col_1", Obj);
  meeting = new Meeting(Obj, "col_1", "col_2")

  Obj.loadAll()

  $("#add_object").asEventStream("click").onValue( => createObject("col_1"))


createObject = (block)=>

  color = get_random_color()
  top = Math.round(Math.random()*(window.innerHeight-100))
  left = Math.round(Math.random()*($("#" + block).width()-200))
  height = Math.round(Math.random()*(window.innerHeight-top) / 2) + 30
  width = Math.round(Math.random()*($("#" + block).width()-left) / 3) + 60

  obj = new Obj(block, null, left, top, width, height, color)

get_random_color = =>
  letters = '0123456789ABCDEF'.split('')
  color = '#'
  for i in [0..5]
    color += letters[Math.floor(Math.random() * 16)]
  color
